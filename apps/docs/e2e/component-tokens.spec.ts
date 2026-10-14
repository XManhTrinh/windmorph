import { readFileSync } from 'node:fs';
import { expect, test, type Locator, type Page } from '@playwright/test';
import * as windmorph from '@windmorph/react';
import {
  componentTokenList,
  isComponentTokenSet,
  type ComponentTokenSet,
  type PublicComponentToken,
} from '@windmorph/react';
import { openStory } from './story';

/*
 * Every public component token changes what it says it paints. Driven by the token sets the
 * library exports, so a new set is tested as soon as it has a probe story: `Tokens/<set
 * name>`, rendered with `stories/tokens/probe.tsx`'s `TokenProbe`.
 *
 * Per token, the spec sets the public variable on `:root` to a sentinel and checks the
 * computed property on the element the token's `paints` names: the root, or its first
 * `data-slot` element in the named state (`[data-slot="day"][data-selected]`). Per set, it
 * also checks a token set on an ancestor, a role value declared on `[data-theme]` inside a
 * forest, dark ThemeScope (for a set with a colour token), and that a consumer class beats
 * the token.
 */

const SETS = Object.values(windmorph)
  .filter(isComponentTokenSet)
  .filter((set) => set.name.startsWith('md-comp-'));

const STORY_IDS = new Set(
  Object.keys(
    (
      JSON.parse(
        readFileSync(new URL('../storybook-static/index.json', import.meta.url), 'utf8'),
      ) as { entries: Record<string, unknown> }
    ).entries,
  ),
);

/** Storybook's id for the `Tokens/<set name>` probe story. */
const probeStoryId = (set: ComponentTokenSet) => `tokens-${set.name}--probe`;

const SENTINEL_COLOR = 'rgb(1, 2, 3)';

/** The value a token is set to, and how the computed property must read back. */
function sentinel(property: string): { value: string; matches: (computed: string) => boolean } {
  if (property === 'box-shadow') {
    return {
      value: `0 0 0 7px ${SENTINEL_COLOR}`,
      matches: (computed) => computed.includes(SENTINEL_COLOR) && computed.includes('7px'),
    };
  }
  // A gradient (a band drawn with `background-image`) carries the colour inside it.
  if (property === 'background-image') {
    return { value: SENTINEL_COLOR, matches: (computed) => computed.includes(SENTINEL_COLOR) };
  }
  if (property.endsWith('radius'))
    return { value: '7px', matches: (computed) => computed === '7px' };
  if (property === 'opacity') return { value: '0.5', matches: (computed) => computed === '0.5' };
  return { value: SENTINEL_COLOR, matches: (computed) => computed === SENTINEL_COLOR };
}

/** The state a token's element needs, as a selector: on its slot, or on the root without one. */
const stateSelector = (token: PublicComponentToken) =>
  token.paints?.state ? `[data-${token.paints.state}]` : '';

/** The selector for a token's component root: its set, scope value and (slotless) state. */
function rootSelector(set: ComponentTokenSet, token: PublicComponentToken): string {
  const scope = token.scope ? `[data-${token.scope.attribute}="${token.scope.value}"]` : '';
  const state = token.paints?.slot ? '' : stateSelector(token);
  return `[data-tokens~="${set.name}"]${scope}${state}`;
}

/** The element a token paints inside `root`: the root itself, or its slot in that state. */
const painted = (root: Locator, token: PublicComponentToken) =>
  token.paints?.slot
    ? root.locator(`[data-slot="${token.paints.slot}"]${stateSelector(token)}`).first()
    : root;

/** The element a token paints: in the first root outside the extra instances. */
async function target(
  page: Page,
  set: ComponentTokenSet,
  token: PublicComponentToken,
): Promise<Locator> {
  const root = rootSelector(set, token);
  const roots = page.locator(root);
  const count = await roots.count();
  for (let index = 0; index < count; index++) {
    const candidate = roots.nth(index);
    const extra = await candidate.evaluate((el) => el.closest('[data-probe-extra]') !== null);
    if (extra) continue;
    return painted(candidate, token);
  }
  throw new Error(`No ${root} in the probe story`);
}

const computed = (locator: Locator, property: string) =>
  locator.evaluate((el, name) => getComputedStyle(el).getPropertyValue(name), property);

async function setVariable(page: Page, selector: string, name: string, value: string | null) {
  await page
    .locator(selector)
    .first()
    .evaluate(
      (el, [variable, to]) => {
        const style = (el as HTMLElement).style;
        if (to === null) style.removeProperty(variable!);
        else style.setProperty(variable!, to);
      },
      [name, value] as const,
    );
}

test.describe('Component tokens', () => {
  test('every core token set has a probe story', () => {
    expect(SETS.length).toBeGreaterThan(0);
    expect(SETS.map(probeStoryId).filter((id) => !STORY_IDS.has(id))).toEqual([]);
  });

  for (const set of SETS) {
    test.describe(set.name, () => {
      const tokens = componentTokenList(set);

      test.beforeEach(async ({ page }) => {
        await openStory(page, probeStoryId(set));
        // Read final values, never a transition's frame.
        await page.addStyleTag({
          content: '*, *::before, *::after { transition: none !important; }',
        });
      });

      for (const token of tokens) {
        test(`${token.name} paints ${token.paints?.property}`, async ({ page }) => {
          const property = token.paints!.property;
          const element = await target(page, set, token);
          const { value, matches } = sentinel(property);
          expect(matches(await computed(element, property)), 'already the sentinel').toBe(false);
          await setVariable(page, 'html', token.name, value);
          const after = await computed(element, property);
          expect(matches(after), `read back ${after}`).toBe(true);
        });
      }

      test('a token set on an ancestor applies inside it', async ({ page }) => {
        const token = tokens[0]!;
        const element = await target(page, set, token);
        const { value, matches } = sentinel(token.paints!.property);
        await setVariable(page, '[data-probe="instances"]', token.name, value);
        const after = await computed(element, token.paints!.property);
        expect(matches(after), `read back ${after}`).toBe(true);
      });

      test('a role value declared on [data-theme] follows a ThemeScope', async ({ page }) => {
        const colours = tokens.filter((token) => /color|fill|stroke/.test(token.paints!.property));
        test.skip(colours.length === 0, 'the set has no colour token');
        const scoped = page.locator('[data-probe-extra="scoped"]');
        // The first colour token that applies to the scoped instance.
        let match: { token: PublicComponentToken; element: Locator } | undefined;
        for (const token of colours) {
          const root = scoped.locator(rootSelector(set, token)).first();
          if ((await root.count()) === 0) continue;
          const element = painted(root, token);
          if ((await element.count()) === 0) continue;
          match = { token, element };
          break;
        }
        expect(match, 'the scoped instance has no colour token').toBeDefined();
        const { token, element } = match!;
        await page.addStyleTag({
          content: `:root, [data-theme] { ${token.name}: var(--md-sys-color-tertiary); }`,
        });
        const tertiary = await element.evaluate((el, property) => {
          const probe = document.createElement('span');
          probe.style.setProperty('color', 'var(--md-sys-color-tertiary)');
          el.append(probe);
          const value = getComputedStyle(probe).color;
          probe.remove();
          return { value, property: getComputedStyle(el).getPropertyValue(property) };
        }, token.paints!.property);
        expect(tertiary.property).toBe(tertiary.value);
        // The forest, dark tertiary, not the light baseline one from `:root`.
        const rootTertiary = await page.evaluate(() => {
          const probe = document.createElement('span');
          probe.style.setProperty('color', 'var(--md-sys-color-tertiary)');
          document.body.append(probe);
          const value = getComputedStyle(probe).color;
          probe.remove();
          return value;
        });
        expect(tertiary.value).not.toBe(rootTertiary);
      });

      test('a consumer class beats the token', async ({ page }) => {
        const override = page.locator('[data-probe-extra="override"]');
        const name = await override.getAttribute('data-probe-token');
        const token = tokens.find((candidate) => candidate.name === name);
        expect(token, `data-probe-token names no token of ${set.name}`).toBeDefined();
        const element = painted(override.locator(rootSelector(set, token!)).first(), token!);
        const { value, matches } = sentinel(token!.paints!.property);
        await setVariable(page, 'html', token!.name, value);
        expect(matches(await computed(element, token!.paints!.property))).toBe(false);
      });
    });
  }
});
