import type { Page } from '@playwright/test';

/**
 * Evaluates `expression` in the page on every frame, at the point the frame is painted, while
 * `act` runs and for `duration` ms from the start. A value read in an animation frame callback
 * can come before a correction the page makes later in the same frame (a component holding a
 * pressed element in place scrolls in its own callback), so each frame flips the size of a
 * hidden fixed probe and reads in its ResizeObserver callback, which runs after every animation
 * frame callback and layout, just before paint. Fixed elements are never scroll anchors, so the
 * probe changes nothing it measures.
 */
export async function samplePaintedFrames<T>(
  page: Page,
  expression: string,
  act: () => Promise<unknown>,
  duration = 1500,
): Promise<T[]> {
  await page.evaluate(
    ({ expression, duration }) => {
      const read = new Function(`return (${expression});`) as () => unknown;
      const probe = document.createElement('div');
      probe.style.cssText =
        'position:fixed;top:0;left:0;width:1px;height:1px;visibility:hidden;pointer-events:none';
      document.body.append(probe);
      const values: unknown[] = [read()];
      const record = { values, done: false };
      (window as unknown as { paintedFrames: typeof record }).paintedFrames = record;
      const observer = new ResizeObserver(() => values.push(read()));
      observer.observe(probe);
      const start = performance.now();
      const tick = () => {
        if (performance.now() - start > duration) {
          observer.disconnect();
          probe.remove();
          values.push(read());
          record.done = true;
          return;
        }
        probe.style.width = probe.style.width === '2px' ? '1px' : '2px';
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    },
    { expression, duration },
  );
  await act();
  await page.waitForFunction(
    () => (window as unknown as { paintedFrames: { done: boolean } }).paintedFrames.done,
    undefined,
    { timeout: duration + 5000 },
  );
  return page.evaluate(
    () => (window as unknown as { paintedFrames: { values: unknown[] } }).paintedFrames.values,
  ) as Promise<T[]>;
}
