import { expect, type Locator, type Page } from '@playwright/test';

/** A pending button keeps its size and corners in every layout, and ignores presses. */
export async function pendingCheck(page: Page, target: Locator) {
  await expect(target).toHaveAttribute('data-pending', 'true');
  await expect(target.locator('[data-slot="pending-indicator"] svg')).toBeVisible();
  // `force`: Playwright counts `aria-disabled` as not enabled and would wait for it.
  await target.click({ force: true });
  await expect(page.getByTestId('count')).toHaveText('Pressed 0');
}

/** Layout boxes (offset sizes, unaffected by transforms) of every `[data-testid]` under `root`. */
export async function layoutBoxes(root: Locator): Promise<Record<string, string>> {
  return root.evaluate((element) =>
    Object.fromEntries(
      [...element.querySelectorAll<HTMLElement>('[data-testid]')].map((el) => {
        const rect = el.getBoundingClientRect();
        return [
          el.dataset.testid!,
          `${el.offsetWidth}×${el.offsetHeight} at ${Math.round(rect.left)},${Math.round(rect.top)}`,
        ];
      }),
    ),
  );
}

/** Waits until every pending button under `root` shows its indicator (past the 200ms delay). */
export async function waitForIndicators(root: Locator) {
  await expect
    .poll(() =>
      root.evaluate((element) =>
        [...element.querySelectorAll('[data-pending]')].every((button) => {
          const slot = button.querySelector('[data-slot="pending-indicator"]');
          return slot !== null && getComputedStyle(slot).opacity === '1';
        }),
      ),
    )
    .toBe(true);
}

/** WCAG contrast ratio of two `rgb()` / `rgba()` / `color(srgb …)` colours (alpha ignored). */
export function contrastRatio(a: number[], b: number[]): number {
  const luminance = ([r, g, b]: number[]) => {
    const [R, G, B] = [r!, g!, b!].map((v) => {
      const c = v / 255;
      return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * R! + 0.7152 * G! + 0.0722 * B!;
  };
  const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (l1! + 0.05) / (l2! + 0.05);
}

/**
 * Each pending button's indicator colour against what's behind the button (its container, or
 * the first painted ancestor for a transparent one), as RGB read back from a canvas, so every
 * colour syntax compares the same.
 */
export async function indicatorContrasts(root: Locator): Promise<Record<string, number>> {
  const pairs = await root.evaluate((element) => {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 1;
    const context = canvas.getContext('2d', { willReadFrequently: true })!;
    const rgb = (color: string) => {
      context.clearRect(0, 0, 1, 1);
      context.fillStyle = color;
      context.fillRect(0, 0, 1, 1);
      return [...context.getImageData(0, 0, 1, 1).data.slice(0, 4)];
    };
    const backdrop = (from: Element) => {
      for (let node: Element | null = from; node; node = node.parentElement) {
        const color = rgb(getComputedStyle(node).backgroundColor);
        if (color[3]! > 0) return color;
      }
      return rgb(getComputedStyle(document.body).backgroundColor);
    };
    return [...element.querySelectorAll<HTMLElement>('[data-pending][data-testid]')].map(
      (button) => {
        const slot = button.querySelector('[data-slot="pending-indicator"]')!;
        return [button.dataset.testid!, rgb(getComputedStyle(slot).color), backdrop(button)];
      },
    ) as [string, number[], number[]][];
  });
  return Object.fromEntries(pairs.map(([id, fg, bg]) => [id, contrastRatio(fg, bg)]));
}
