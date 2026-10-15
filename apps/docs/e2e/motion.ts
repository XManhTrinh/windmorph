import type { Page } from '@playwright/test';

/**
 * Starts recording the CSS transitions that start on elements matching `selector`, by
 * property. Call it before the action that starts them: a transition is recorded as it
 * starts, so it can't finish unseen on a slow machine before the test looks. Returns a
 * reader for what has been recorded so far (poll it: `transitionrun` fires on the next frame).
 */
export async function recordTransitions(page: Page, selector: string) {
  const index = await page.evaluate((sel) => {
    const store = window as unknown as { recordedTransitions?: string[][] };
    const properties: string[] = [];
    (store.recordedTransitions ??= []).push(properties);
    document.addEventListener(
      'transitionrun',
      (event) => {
        if (event.target instanceof Element && event.target.matches(sel)) {
          properties.push(event.propertyName);
        }
      },
      true,
    );
    return store.recordedTransitions.length - 1;
  }, selector);
  return () =>
    page.evaluate(
      (i) => (window as unknown as { recordedTransitions: string[][] }).recordedTransitions[i]!,
      index,
    );
}
