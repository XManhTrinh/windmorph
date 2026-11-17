import { expect, test, type Page } from '@playwright/test';
import { openStory, type StoryGlobals } from './story';

/*
 * Motion on values (`docs/plans/motion-primitives.md`), frame by frame: what a spring does
 * between its ends, which the unit tests (no layout, no real frames) can't see.
 */

interface Sample {
  t: number;
  value: number;
}

/**
 * Records `read` of the element with `testId` on every animation frame for `ms`, clicking the
 * buttons named in `presses` at their times (ms) from the start, all inside the page so no
 * frame is missed.
 */
async function record(
  page: Page,
  testId: string,
  read: 'height' | 'width' | 'length' | 'text',
  presses: { name: string; at: number }[],
  ms = 1400,
) {
  return page.evaluate(
    ({ testId, read, presses, ms }) =>
      new Promise<{ samples: Sample[]; pressedAt: number[] }>((resolve) => {
        const element = document.querySelector<HTMLElement>(`[data-testid="${testId}"]`)!;
        const value = () => {
          if (read === 'length') return (element as unknown as SVGPathElement).getTotalLength();
          if (read === 'text')
            return Number(
              element.querySelector('[data-slot="figure"]')!.textContent!.replace(/[^\d.]/g, ''),
            );
          return element.getBoundingClientRect()[read];
        };
        const buttons = [...document.querySelectorAll('button')];
        const samples: Sample[] = [];
        const pressedAt: number[] = [];
        const start = performance.now();
        for (const { name, at } of presses) {
          setTimeout(() => {
            pressedAt.push(performance.now() - start);
            buttons.find((button) => button.textContent === name)!.click();
          }, at);
        }
        const frame = () => {
          const t = performance.now() - start;
          samples.push({ t, value: value() });
          if (t < ms) requestAnimationFrame(frame);
          else resolve({ samples, pressedAt });
        };
        requestAnimationFrame(frame);
      }),
    { testId, read, presses, ms },
  );
}

const open = (page: Page, story: string, globals: StoryGlobals = {}) =>
  openStory(page, `foundations-motion-values--${story}`, globals);

test.describe('Motion values', () => {
  test('a spring value settles on its target and overshoots only in the expressive scheme', async ({
    page,
  }) => {
    await open(page, 'spring-value', { motion: 'standard' });
    const standard = await record(page, 'bar', 'height', [{ name: 'To 300', at: 0 }]);
    expect(Math.max(...standard.samples.map((sample) => sample.value))).toBeLessThanOrEqual(300.5);
    expect(standard.samples.at(-1)!.value).toBeCloseTo(300, 0);
    // It moves through the heights between, not in one step.
    expect(standard.samples.some((sample) => sample.value > 60 && sample.value < 280)).toBe(true);

    await open(page, 'spring-value', { motion: 'expressive' });
    const expressive = await record(page, 'bar', 'height', [{ name: 'To 300', at: 0 }]);
    expect(Math.max(...expressive.samples.map((sample) => sample.value))).toBeGreaterThan(301);
  });

  test('a new target mid-move keeps the speed it has', async ({ page }) => {
    await open(page, 'spring-value');
    // Rising fast towards 300, it's sent to 200, just above where it is: carrying its speed,
    // it rises well past 200 before settling there. Restarted from rest it would pass 200 by
    // under a pixel (the spring's own overshoot on a short move).
    const { samples, pressedAt } = await record(page, 'bar', 'height', [
      { name: 'To 300', at: 0 },
      { name: 'To 200', at: 90 },
    ]);
    const atSwitch = samples.findLast((sample) => sample.t <= pressedAt[1]!)!.value;
    expect(atSwitch).toBeGreaterThan(80);
    expect(atSwitch).toBeLessThan(200);
    const after = samples.filter((sample) => sample.t > pressedAt[1]!);
    expect(Math.max(...after.map((sample) => sample.value))).toBeGreaterThan(212);
    expect(after.at(-1)!.value).toBeCloseTo(200, 0);
  });

  test('a list of another length starts from the old shape', async ({ page }) => {
    await open(page, 'spring-values');
    const { samples, pressedAt } = await record(page, 'line', 'length', [
      { name: '84 points', at: 50 },
    ]);
    const switched = samples.findIndex((sample) => sample.t > pressedAt[0]!);
    for (let index = Math.max(1, switched - 1); index < samples.length; index++) {
      expect(Math.abs(samples[index]!.value - samples[index - 1]!.value)).toBeLessThan(12);
    }
    // It did become the other line, and settled there.
    expect(Math.abs(samples.at(-1)!.value - samples[0]!.value)).toBeGreaterThan(2);
    expect(samples.at(-1)!.value).toBeCloseTo(samples.at(-2)!.value, 0);
  });

  test('a counting number never shows a figure past its target and keeps its width', async ({
    page,
  }) => {
    await open(page, 'counting-number');
    // Each count keeps the box at its final value's width from the press on, down and up.
    const widthsAfter = ({ samples, pressedAt }: Awaited<ReturnType<typeof record>>) =>
      new Set(
        samples.filter((sample) => sample.t > pressedAt[0]! + 20).map((s) => Math.round(s.value)),
      );
    const down = await record(page, 'number', 'width', [{ name: 'Change', at: 0 }], 900);
    expect(widthsAfter(down).size).toBe(1);
    const up = await record(page, 'number', 'width', [{ name: 'Change', at: 0 }], 900);
    expect(widthsAfter(up).size).toBe(1);
    expect([...widthsAfter(up)][0]).toBeGreaterThan([...widthsAfter(down)][0]!);

    const figures = await record(page, 'number', 'text', [{ name: 'Change', at: 0 }]);
    const back = await record(page, 'number', 'text', [{ name: 'Change', at: 0 }]);
    expect(Math.min(...figures.samples.map((sample) => sample.value))).toBeGreaterThanOrEqual(96);
    expect(figures.samples.some((sample) => sample.value > 96 && sample.value < 1284)).toBe(true);
    expect(figures.samples.at(-1)!.value).toBe(96);
    expect(Math.max(...back.samples.map((sample) => sample.value))).toBeLessThanOrEqual(1284);
    expect(back.samples.at(-1)!.value).toBe(1284);
    await expect(page.getByText('1,284', { exact: true }).first()).toBeAttached();
    // Selected and copied, it gives the figure once.
    const copied = await page.getByTestId('number').evaluate((element) => {
      const range = document.createRange();
      range.selectNodeContents(element);
      const selection = window.getSelection()!;
      selection.removeAllRanges();
      selection.addRange(range);
      return selection.toString();
    });
    expect(copied.trim()).toBe('1,284');
  });

  test('an entrance plays once, one bar after another, as the row comes into view', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 800, height: 600 });
    await open(page, 'entrance');
    const bars = page.getByTestId('row-bar');
    expect(await bars.first().evaluate((bar) => bar.getBoundingClientRect().height)).toBe(0);
    await page.getByTestId('row').scrollIntoViewIfNeeded();
    const firstBar = await record(page, 'row-bar', 'height', [], 120);
    const heights = await bars.evaluateAll((all) =>
      all.map((bar) => bar.getBoundingClientRect().height),
    );
    // A moment in, the first bar has risen further than the last.
    expect(firstBar.samples.at(-1)!.value).toBeGreaterThan(0);
    expect(heights[0]!).toBeGreaterThan(heights.at(-1)!);
    await page.waitForTimeout(1000);
    const settled = await bars.evaluateAll((all) =>
      all.map((bar) => bar.getBoundingClientRect().height),
    );
    expect(settled.every((height) => height > 40)).toBe(true);
    // Scrolled away and back, it doesn't play again.
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.getByTestId('row').scrollIntoViewIfNeeded();
    const again = await record(page, 'row-bar', 'height', [], 300);
    expect(new Set(again.samples.map((sample) => Math.round(sample.value))).size).toBe(1);
  });

  test('under reduced motion a value, a list and a number change at once', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await open(page, 'spring-value');
    const bar = await record(page, 'bar', 'height', [{ name: 'To 300', at: 0 }], 300);
    const moving = bar.samples.filter((sample) => sample.value > 41 && sample.value < 299);
    expect(moving).toEqual([]);
    expect(bar.samples.at(-1)!.value).toBeCloseTo(300, 0);

    await open(page, 'spring-values');
    const line = await record(page, 'line', 'length', [{ name: '84 points', at: 50 }], 300);
    // The line's two shapes and nothing between them.
    expect(
      new Set(line.samples.map((sample) => Math.round(sample.value))).size,
    ).toBeLessThanOrEqual(2);
    expect(Math.abs(line.samples.at(-1)!.value - line.samples[0]!.value)).toBeGreaterThan(2);

    await open(page, 'counting-number');
    const number = await record(page, 'number', 'text', [{ name: 'Change', at: 0 }], 300);
    expect(number.samples.filter((sample) => sample.value !== 1284 && sample.value !== 96)).toEqual(
      [],
    );
    expect(number.samples.at(-1)!.value).toBe(96);
  });
});
