import { expect, test } from '@playwright/test';
import { allStoryIds } from './catalog-stories';

/**
 * In every story, the keyboard focus ring of each focusable element keeps at least 2px of its
 * thickness on every side (WCAG 2.4.13's least thickness): a scroller or another ancestor that
 * clips its overflow mustn't cut it away. A ring drawn inside (`focus-ring-inset`) can't be cut;
 * one outside needs room. Found by this check (2026-11-10): the first carousel item's ring was
 * cut on its whole start side.
 *
 * Elements partly scrolled out of their scroller are skipped (scrolling them in is the
 * browser's job), as are the layout-override stories, whose classes clip on purpose.
 */

/** Stories left out, with the reason. */
const SKIPPED = /benchmark|layout-override|positioner-override/;

/** The least part of the ring's thickness that must show, px. */
const LEAST_THICKNESS = 2;

for (const id of allStoryIds.filter((story) => !SKIPPED.test(story))) {
  test(`focus rings keep their thickness · ${id}`, async ({ page }) => {
    await page.goto(`/iframe.html?id=${id}&viewMode=story`);
    await page
      .locator('#storybook-root > *')
      .first()
      .waitFor({ timeout: 8000 })
      .catch(() => undefined);
    await page.evaluate(() => document.fonts.ready);
    const cut = await page.evaluate(async (least) => {
      const found: string[] = [];
      const root = document.getElementById('storybook-root')!;
      const focusables = [
        ...root.querySelectorAll<HTMLElement>('a[href], button, input, [tabindex]'),
      ].filter(
        (element) =>
          element.tabIndex >= 0 &&
          !(element as HTMLButtonElement).disabled &&
          !element.closest('[inert], [aria-hidden="true"]') &&
          element.getClientRects().length > 0,
      );
      for (const element of focusables.slice(0, 60)) {
        // Keyboard modality, so React Aria and `:focus-visible` show the ring.
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }));
        element.focus({ preventScroll: true });
        await new Promise((resolve) => requestAnimationFrame(resolve));
        if (document.activeElement !== element) continue;
        // The ring is on the element or on the part that draws it for it (a field's box).
        let ringed: HTMLElement | null = element;
        while (ringed && ringed !== root && getComputedStyle(ringed).outlineStyle === 'none') {
          ringed = ringed.parentElement;
        }
        if (!ringed || ringed === root) continue;
        const style = getComputedStyle(ringed);
        const thickness = parseFloat(style.outlineWidth);
        const outside = parseFloat(style.outlineOffset) + thickness;
        if (thickness === 0 || outside <= 0) continue;
        const box = ringed.getBoundingClientRect();
        for (let clip = ringed.parentElement; clip && clip !== document.body;) {
          const clipStyle = getComputedStyle(clip);
          if (clipStyle.overflowX === 'visible' && clipStyle.overflowY === 'visible') {
            clip = clip.parentElement;
            continue;
          }
          const outer = clip.getBoundingClientRect();
          const left = outer.left + clip.clientLeft;
          const top = outer.top + clip.clientTop;
          const right = left + clip.clientWidth;
          const bottom = top + clip.clientHeight;
          // Partly scrolled out: not this check's concern.
          if (box.left < left - 0.5 || box.right > right + 0.5) break;
          if (box.top < top - 0.5 || box.bottom > bottom + 0.5) break;
          const lost = Math.max(
            left - (box.left - outside),
            box.right + outside - right,
            top - (box.top - outside),
            box.bottom + outside - bottom,
          );
          if (lost > thickness - least + 0.5) {
            const name = (element.getAttribute('aria-label') ?? element.textContent ?? '').trim();
            found.push(
              `"${name.slice(0, 40)}" loses ${lost.toFixed(1)}px of its ${thickness}px ring`,
            );
          }
          break;
        }
      }
      return [...new Set(found)];
    }, LEAST_THICKNESS);
    expect(cut).toEqual([]);
  });
}
