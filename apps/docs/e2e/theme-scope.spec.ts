import { expect, test } from '@playwright/test';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { openStory } from './story';

/**
 * Every story renders inside the preview's `ThemeScope`, while the document root keeps the
 * default theme (baseline, light). With the toolbar set to a dark non-root theme, each
 * component's resolved colours must come from the scope: none may be a colour that only the
 * root theme has. A colour read through Tailwind's root-only `--color-*` variables, or a
 * custom property resolved at `:root`, would keep the root's light value (the top app bar's
 * scrolled fill and the slider's disabled handle once did).
 *
 * Stories come from the static build's index (`turbo run test:e2e` builds it first). Token
 * stories are left out: they set component tokens to colours of their own on purpose.
 */
const INDEX = fileURLToPath(new URL('../storybook-static/index.json', import.meta.url));

interface IndexEntry {
  id: string;
  type: 'story' | 'docs';
}

const stories = existsSync(INDEX)
  ? Object.values(
      (JSON.parse(readFileSync(INDEX, 'utf8')) as { entries: Record<string, IndexEntry> }).entries,
    )
      .filter((entry) => entry.type === 'story' && !entry.id.startsWith('tokens-'))
      .map((entry) => entry.id)
  : [];

const SCOPE = { theme: 'forest', mode: 'dark' } as const;

test('the static build lists the stories', () => {
  expect(stories.length).toBeGreaterThan(100);
});

test.describe('Theme scope', () => {
  for (const id of stories) {
    test(id, async ({ page }) => {
      await openStory(page, id, SCOPE);
      // Let enter transitions (overlays open by default) reach their resting colours.
      await page.waitForTimeout(400);
      const leaks = await page.evaluate(() => {
        /** `[r, g, b, alpha]` from a computed `rgb()`, `rgba()` or `color(srgb …)` value. */
        const parse = (value: string): number[][] =>
          [
            ...value.matchAll(
              /rgba?\(\s*([\d.]+)[ ,]+([\d.]+)[ ,]+([\d.]+)(?:\s*[,/]\s*([\d.]+%?))?\s*\)|color\(srgb\s+([\d.e-]+)\s+([\d.e-]+)\s+([\d.e-]+)(?:\s*\/\s*([\d.]+%?))?\s*\)/g,
            ),
          ].map((match) => {
            const alpha = (raw: string | undefined) =>
              raw === undefined ? 1 : raw.endsWith('%') ? parseFloat(raw) / 100 : parseFloat(raw);
            if (match[1] !== undefined) {
              return [Number(match[1]), Number(match[2]), Number(match[3]), alpha(match[4])].map(
                (n, i) => (i < 3 ? Math.round(n) : n),
              );
            }
            return [
              Math.round(Number(match[5]) * 255),
              Math.round(Number(match[6]) * 255),
              Math.round(Number(match[7]) * 255),
              alpha(match[8]),
            ];
          });
        const key = ([r, g, b]: number[]) => `${r},${g},${b}`;

        // Every colour role the stylesheets define.
        const names = new Set<string>();
        for (const sheet of document.styleSheets) {
          let rules: CSSRuleList;
          try {
            rules = sheet.cssRules;
          } catch {
            continue;
          }
          for (const rule of rules) {
            for (const [name] of rule.cssText.matchAll(/--md-sys-color-[a-z-]+(?=\s*:)/g)) {
              names.add(name);
            }
          }
        }

        /** The colour roles resolved on an element, as `r,g,b` keys. */
        const probe = document.createElement('span');
        const roles = (element: Element) => {
          element.append(probe);
          const keys = new Map<string, string>();
          for (const name of names) {
            probe.style.color = `var(${name})`;
            const [rgb] = parse(getComputedStyle(probe).color);
            if (rgb) keys.set(key(rgb), name);
          }
          probe.remove();
          return keys;
        };

        const scopes = [...document.querySelectorAll('[data-theme]')].filter(
          (element) => element !== document.documentElement,
        );
        if (scopes.length === 0) return ['no ThemeScope in the story'];
        const root = roles(document.documentElement);
        const scoped = roles(scopes[0]!);
        // Colours only the root theme has (a shared value, say pure black, proves nothing).
        const rootOnly = new Map([...root].filter(([rgb]) => !scoped.has(rgb)));

        const PROPERTIES = [
          'color',
          'background-color',
          'background-image',
          'border-top-color',
          'border-right-color',
          'border-bottom-color',
          'border-left-color',
          'outline-color',
          'text-decoration-color',
          'box-shadow',
          'fill',
          'stroke',
          'caret-color',
        ];
        const found = new Set<string>();
        const elements = new Set(
          scopes.flatMap((scope) => [scope, ...scope.querySelectorAll('*')]),
        );
        for (const element of elements) {
          // Colours nobody can see prove nothing.
          if (!element.checkVisibility({ visibilityProperty: true })) continue;
          for (const pseudo of [null, '::before', '::after']) {
            const style = getComputedStyle(element, pseudo);
            if (pseudo && style.content === 'none') continue;
            for (const property of PROPERTIES) {
              for (const colour of parse(style.getPropertyValue(property))) {
                if (colour[3] === 0) continue;
                const role = rootOnly.get(key(colour));
                if (!role) continue;
                const name =
                  element.getAttribute('data-slot') ??
                  element.getAttribute('data-testid') ??
                  element.getAttribute('role') ??
                  element.tagName.toLowerCase();
                found.add(`${name}${pseudo ?? ''} ${property}: the root's ${role}`);
              }
            }
          }
        }
        return [...found];
      });
      expect(leaks).toEqual([]);
    });
  }
});
