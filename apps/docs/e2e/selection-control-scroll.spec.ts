import { expect, test, type Page } from '@playwright/test';
import { openStory } from './story';

/*
 * A tap on the visible part of a checkbox, radio button or switch (or a list row drawing
 * one) whose hidden input sits above the window must not scroll the page: React Aria
 * focuses that input, and a plain focus() made Chrome centre it (about 430px).
 */
test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

/** Pads the story with 1500px above and below, so the page can scroll both ways. */
async function padPage(page: Page) {
  await page.evaluate(() => {
    const root = document.querySelector('#storybook-root')!;
    const spacer = document.createElement('div');
    spacer.style.height = '1500px';
    root.before(spacer);
    root.after(spacer.cloneNode());
  });
}

const cases: [string, string, string, number][] = [
  // name, story, element whose top is scrolled `above` px above the window, how far
  ['checkbox', 'components-checkbox--playground', '[data-selection-control]', 30],
  ['switch', 'components-switch--playground', '[data-slot=track]', 20],
  ['radio', 'components-radio--playground', 'label:nth-of-type(2) [data-selection-control]', 30],
  [
    'list switch row',
    'components-list--toggles',
    '[data-testid=toggles] li:nth-of-type(1) label',
    40,
  ],
  [
    'list checkbox row',
    'components-list--toggles',
    '[data-testid=toggles] [aria-label="Notify me about"] li:nth-of-type(1) label',
    40,
  ],
  ['list radio row', 'components-list--radio-list', '[data-testid=radio-list] label >> nth=2', 40],
];

for (const [name, story, selector, above] of cases) {
  test(`tapping a ${name} partly above the window leaves the page where it is`, async ({
    page,
  }) => {
    await openStory(page, story);
    await padPage(page);
    const target = page.locator(selector).first();
    await target.evaluate((el, above) => {
      window.scrollBy(0, el.getBoundingClientRect().top + above);
    }, above);
    await page.waitForTimeout(250);
    const before = await page.evaluate(() => window.scrollY);
    const box = (await target.boundingBox())!;
    const input = target.locator('xpath=ancestor-or-self::label').locator('input').first();
    const checked = await input.isChecked();
    // The lowest visible part of the target, inside the window.
    await page.touchscreen.tap(
      box.x + Math.min(box.width / 2, 60),
      Math.max(box.y + box.height - 6, 3),
    );
    await expect.poll(() => input.isChecked()).toBe(name.includes('radio') ? true : !checked);
    await page.waitForTimeout(300);
    expect(await page.evaluate(() => window.scrollY)).toBe(before);
  });
}
