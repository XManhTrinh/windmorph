import { expect, test, type Locator, type Page } from '@playwright/test';
import { openStory } from './story';

const OVERRIDES = [
  'none',
  'fixed',
  'absolute',
  'sticky',
  'static',
  'overflowHidden',
  'overflowVisible',
  'fullWidth',
  'transform',
];

export interface LayoutSafetyExpectations {
  /** Layout height in px. */
  height: number;
  /** Layout width in px, checked for every override except `fullWidth`. */
  width?: number;
  /** Computed top-left corner radius at rest. */
  radius: string;
  /**
   * Non-interactive components (no state layer, press or focus) skip those checks; their
   * story needs no `count`. @default true
   */
  interactive?: boolean;
  /** Extra component-specific checks, run for every combination. */
  check?: (page: Page, target: Locator) => Promise<void>;
}

/**
 * Architecture §10 override matrix for a story that renders `data-testid="target"` with a
 * `override` arg and (for interactive components) counts presses in `data-testid="count"`.
 * Every consumer layout class, with and without a transformed ancestor, in both directions,
 * must keep the component's size, corners and unpositioned internals, plus, when
 * interactive, its background state layer, press handling and outline focus ring.
 */
export function layoutSafetySuite(storyId: string, expected: LayoutSafetyExpectations) {
  for (const override of OVERRIDES) {
    for (const transformedAncestor of [false, true]) {
      for (const dir of ['ltr', 'rtl'] as const) {
        const name = `${override}${transformedAncestor ? ' · transformed ancestor' : ''} · ${dir}`;
        test(name, async ({ page }) => {
          await openStory(page, storyId, { dir }, { override, transformedAncestor });
          const target = page.getByTestId('target');
          // Layout size, not the on-screen box (which a rotate transform enlarges).
          const layout = await target.evaluate((el) => {
            const s = getComputedStyle(el);
            return {
              height: (el as HTMLElement).offsetHeight,
              width: (el as HTMLElement).offsetWidth,
              backgroundImage: s.backgroundImage,
              radius: s.borderTopLeftRadius,
              // Touch targets and visually hidden inputs (clipped to nothing) can't affect
              // what the component looks like.
              positionedDescendants: [...el.querySelectorAll('*')].filter((child) => {
                const style = getComputedStyle(child);
                return (
                  child.closest('[data-touch-target]') === null &&
                  style.clipPath !== 'inset(50%)' &&
                  ['absolute', 'fixed'].includes(style.position)
                );
              }).length,
            };
          });
          expect(layout.height).toBe(expected.height);
          if (expected.width !== undefined && override !== 'fullWidth') {
            expect(layout.width).toBe(expected.width);
          }
          expect(layout.radius).toBe(expected.radius);
          expect(layout.positionedDescendants).toBe(0);
          await expected.check?.(page, target);
          if (expected.interactive === false) return;

          expect(layout.backgroundImage).toContain('linear-gradient');
          await target.click();
          await expect(page.getByTestId('count')).toHaveText('Pressed 1');
          await page.keyboard.press('Shift+Tab');
          await page.keyboard.press('Tab');
          await expect(target).toHaveAttribute('data-focus-visible', 'true');
          expect(await target.evaluate((el) => getComputedStyle(el).outlineStyle)).toBe('solid');
        });
      }
    }
  }
}
