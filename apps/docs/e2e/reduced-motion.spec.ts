import { expect, test, type Locator, type Page } from '@playwright/test';
import { changed, expectNoMovement, faded, fadedVisibly } from './reduced-motion';
import { openStory } from './story';

/*
 * Reduced motion (architecture §6): under `prefers-reduced-motion: reduce` nothing slides,
 * grows, morphs or turns; state changes are instant or fade, and each one still reaches its
 * end state. Every test records the change frame by frame (`expectNoMovement`). Components
 * with their own reduced-motion tests elsewhere: dialog (dialog-motion.spec.ts), menu,
 * search, carousel, pickers, progress, loading indicator, button, button group, split
 * button, icon faces and shapes.
 */
test.use({ reducedMotion: 'reduce' });

const opacity = (locator: Locator) =>
  locator.evaluate((element) => Number(getComputedStyle(element).opacity));

/** Presses an element by its locator after the recording has started. */
const press = (locator: Locator) => () => locator.click();

/** Scrolls a story's scroller to `y` and waits for the frame that follows. */
async function scrollTo(page: Page, scroller: Locator, y: number) {
  await scroller.evaluate((element, top) => element.scrollTo(0, top), y);
  await page.evaluate(
    () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
  );
}

test.describe('selection controls', () => {
  test('the switch thumb jumps to the other end', async ({ page }) => {
    await openStory(page, 'components-switch--playground');
    const input = page.getByRole('switch', { name: 'Wi-Fi' });
    const track = input.locator('xpath=ancestor::label[1]').locator('.w-\\[52px\\]');
    const thumb = track.locator('> span.absolute').last();
    const wasChecked = await input.isChecked();
    const result = await expectNoMovement(page, {
      parts: { thumb },
      act: press(input.locator('xpath=ancestor::label[1]')),
    });
    await expect(input).toBeChecked({ checked: !wasChecked });
    expect(changed(result, 'thumb', 'left')).toBe(true);
  });

  test('the radio dot appears at full size', async ({ page }) => {
    await openStory(page, 'components-radio--playground');
    const express = page.getByRole('radio', { name: 'Express' });
    const dot = express
      .locator('xpath=ancestor::label[1]')
      .locator('.rounded-full.border-2')
      .locator('span');
    const result = await expectNoMovement(page, {
      parts: { dot },
      act: press(express.locator('xpath=ancestor::label[1]')),
    });
    await expect(express).toBeChecked();
    expect(result.frames.dot!.at(-1)!.width).toBeCloseTo(10, 0);
  });

  test('the checkbox fills and checks without drawing', async ({ page }) => {
    await openStory(page, 'components-checkbox--playground');
    const checkbox = page.getByRole('checkbox').first();
    const wasChecked = await checkbox.isChecked();
    await expectNoMovement(page, {
      parts: { box: checkbox.locator('xpath=ancestor::label[1]') },
      act: press(checkbox.locator('xpath=ancestor::label[1]')),
    });
    await expect(checkbox).toBeChecked({ checked: !wasChecked });
  });

  test('a filter chip shows its check at once', async ({ page }) => {
    await openStory(page, 'components-chips--filters');
    const vegan = page.getByRole('button', { name: 'Vegan' });
    const result = await expectNoMovement(page, { parts: { chip: vegan }, act: press(vegan) });
    await expect(vegan).toHaveAttribute('aria-pressed', 'true');
    expect(changed(result, 'chip', 'width')).toBe(true);
  });
});

test.describe('text fields', () => {
  test('the label floats at once', async ({ page }) => {
    await openStory(page, 'components-textfield--playground');
    const label = page.locator('label', { hasText: 'Label' });
    const input = page.getByLabel('Label', { exact: true });
    const result = await expectNoMovement(page, {
      parts: { label },
      act: () => input.focus(),
    });
    await expect(input).toBeFocused();
    expect(changed(result, 'label', 'top')).toBe(true);
  });
});

test.describe('FABs', () => {
  test('the extended FAB collapses at once and its label fades', async ({ page }) => {
    await openStory(page, 'components-fab--extended-collapse');
    const fab = page.getByTestId('extended-fab');
    await expectNoMovement(page, {
      parts: { fab },
      act: press(page.getByRole('button', { name: 'Collapse' })),
    });
    await expect(fab).toHaveAttribute('data-expanded', 'false');
    const box = (await fab.boundingBox())!;
    expect(box.width).toBe(box.height);
  });

  test('the FAB menu opens with no morph or stagger', async ({ page }) => {
    await openStory(page, 'components-fabmenu--playground', {}, { items: '3' });
    const button = page.getByRole('button', { name: 'Create' });
    const result = await expectNoMovement(page, {
      parts: {
        button,
        first: '[data-fab-menu-item]:last-of-type',
        last: '[data-fab-menu-item]:first-of-type',
      },
      act: press(button),
    });
    await expect(page.getByRole('button', { name: 'Edit' })).toBeVisible();
    expect(result.frames.button!.at(-1)!.width).toBe(56);
    // Every item shows from the same frame, and fades in.
    expect(result.frames.first!.findIndex((frame) => frame.width > 0)).toBe(
      result.frames.last!.findIndex((frame) => frame.width > 0),
    );
    expect(faded(result, 'first')).toBe(true);
  });

  // Re-audit 2026-10-15: `visibility` ran on the spatial duration, 0ms under reduced motion,
  // so a hidden FAB vanished on the first frame and its fade never showed.
  test('a FAB and an extended FAB fade out when hidden', async ({ page }) => {
    await openStory(page, 'components-fab--visibility');
    const result = await expectNoMovement(page, {
      parts: { fab: page.getByTestId('fab'), extended: page.getByTestId('extended-fab') },
      act: press(page.getByRole('button', { name: 'Hide' })),
    });
    expect(fadedVisibly(result, 'fab')).toBe(true);
    expect(fadedVisibly(result, 'extended')).toBe(true);
    await expect(page.getByTestId('fab')).toHaveCSS('visibility', 'hidden');
  });

  test('a hidden FAB menu fades out', async ({ page }) => {
    await openStory(page, 'components-fabmenu--playground');
    // The library-owned box around the button, which carries the show / hide motion.
    const anchor = page.getByTestId('menu').locator(':scope > span.z-\\[1\\]');
    const result = await expectNoMovement(page, {
      parts: { anchor },
      // The attribute `visible={false}` renders on the anchor box.
      act: () => anchor.evaluate((element) => element.setAttribute('data-hidden', 'true')),
    });
    expect(fadedVisibly(result, 'anchor')).toBe(true);
    await expect(anchor).toHaveCSS('visibility', 'hidden');
  });
});

test.describe('navigation', () => {
  test('the bar’s pill fades in whole', async ({ page }) => {
    await openStory(page, 'components-navigation--bar');
    const bar = page.getByRole('navigation', { name: 'Bar start' });
    const sent = bar.getByRole('button', { name: 'Sent mail' });
    const pill = sent.locator(':scope > span > span').first();
    const result = await expectNoMovement(page, { parts: { pill }, act: press(sent) });
    await expect(sent).toHaveAttribute('aria-current', 'page');
    expect(faded(result, 'pill')).toBe(true);
    await expect.poll(() => opacity(pill)).toBe(1);
  });

  test('the rail expands at once', async ({ page }) => {
    await openStory(page, 'components-navigation--rail');
    const rail = page.getByTestId('rail');
    const result = await expectNoMovement(page, {
      parts: { rail, home: page.getByRole('button', { name: 'Home' }) },
      act: press(page.getByRole('button', { name: 'Expand navigation' })),
    });
    await expect(rail).toHaveAttribute('data-expanded', 'true');
    expect(changed(result, 'rail', 'width')).toBe(true);
  });

  test('the modal rail fades in and out at its full width', async ({ page }) => {
    await openStory(page, 'components-navigation--modal-rail');
    const opening = await expectNoMovement(page, {
      parts: { sheet: '[role="dialog"]' },
      act: press(page.getByRole('button', { name: 'Expand navigation' })),
    });
    const sheet = page.getByRole('dialog', { name: 'Main' });
    await expect(sheet).toBeVisible();
    expect(faded(opening, 'sheet')).toBe(true);
    await expect.poll(() => opacity(sheet)).toBe(1);
    const closing = await expectNoMovement(page, {
      parts: { sheet: '[role="dialog"]' },
      act: () => page.keyboard.press('Escape'),
    });
    await expect(page.getByRole('dialog')).toHaveCount(0);
    expect(faded(closing, 'sheet')).toBe(true);
  });

  test('a bar that hides on scroll stays put', async ({ page }) => {
    await openStory(page, 'components-navigation--hide-on-scroll');
    const scroller = page.getByTestId('scroller');
    const bar = page.getByTestId('bar');
    await expectNoMovement(page, {
      parts: { bar },
      act: () => scrollTo(page, scroller, 300),
    });
    expect(await bar.evaluate((el) => el.style.getPropertyValue('--m3-nav-bar-offset'))).toBe('');
  });

  test('the tab indicator jumps to the new tab', async ({ page }) => {
    await openStory(page, 'components-tabs--playground');
    const list = page.getByRole('tablist');
    const sent = page.getByRole('tab', { name: 'Sent' });
    const result = await expectNoMovement(page, {
      parts: { indicator: list.locator('[aria-hidden="true"]').last() },
      act: press(sent),
    });
    await expect(sent).toHaveAttribute('aria-selected', 'true');
    expect(changed(result, 'indicator', 'left')).toBe(true);
  });

  test('a scrollable tab row scrolls to the selected tab at once', async ({ page }) => {
    await openStory(page, 'components-tabs--scrollable');
    const tabs = page.getByRole('tab');
    const last = tabs.last();
    await expectNoMovement(page, {
      parts: { first: tabs.first() },
      act: async () => {
        await last.focus();
        await page.keyboard.press('Enter');
      },
    });
    await expect(last).toHaveAttribute('aria-selected', 'true');
    await expect(last).toBeInViewport();
  });
});

test.describe('top app bars', () => {
  test('an enter-always bar stays on screen', async ({ page }) => {
    await openStory(
      page,
      'components-topappbar--scrolling',
      {},
      { variant: 'small', scrollBehavior: 'enter-always' },
    );
    const scroller = page.getByTestId('scroller');
    const bar = page.getByTestId('bar');
    await expectNoMovement(page, { parts: { bar }, act: () => scrollTo(page, scroller, 400) });
    expect(await bar.evaluate((el) => el.style.getPropertyValue('--m3-app-bar-offset'))).toBe(
      '0px',
    );
    const top = (await scroller.boundingBox())!.y;
    expect((await bar.boundingBox())!.y).toBeCloseTo(top + 1, 0);
  });

  test('an enter-always medium bar only collapses with the scroll', async ({ page }) => {
    await openStory(
      page,
      'components-topappbar--scrolling',
      {},
      { variant: 'medium', scrollBehavior: 'enter-always' },
    );
    const scroller = page.getByTestId('scroller');
    const bar = page.getByTestId('bar');
    await scrollTo(page, scroller, 400);
    await expect(bar).toHaveAttribute('data-collapsed', 'true');
    const height = await bar.evaluate((el) => (el as HTMLElement).offsetHeight);
    // The expanded row has scrolled away; the 64px top row stays.
    expect(await bar.evaluate((el) => el.style.getPropertyValue('--m3-app-bar-offset'))).toBe(
      `-${height - 64}px`,
    );
  });
});

test.describe('sheets', () => {
  for (const [story, name, trigger] of [
    ['components-sheet--bottom', 'bottom', 'Open sheet'],
    ['components-sheet--side', 'side', 'Open filters'],
  ] as const) {
    test(`the ${name} sheet fades in and out where it rests`, async ({ page }) => {
      await openStory(page, story);
      const parts = { sheet: ':has(> [role="dialog"])' };
      const opening = await expectNoMovement(page, {
        parts,
        act: press(page.getByRole('button', { name: trigger })),
      });
      await expect(page.getByRole('dialog')).toBeVisible();
      expect(faded(opening, 'sheet')).toBe(true);
      expect(opening.frames.sheet!.at(-1)!.opacity).toBe(1);
      const closing = await expectNoMovement(page, {
        parts,
        act: () => page.keyboard.press('Escape'),
      });
      await expect(page.getByRole('dialog')).toHaveCount(0);
      expect(faded(closing, 'sheet')).toBe(true);
    });
  }
});

test.describe('lists and toolbars', () => {
  test('a selected list item’s corners change at once', async ({ page }) => {
    await openStory(page, 'components-list--selection');
    const home = page.getByRole('option', { name: /Home/ });
    const result = await expectNoMovement(page, { parts: { home }, act: press(home) });
    await expect(home).toHaveAttribute('aria-selected', 'true');
    expect(changed(result, 'home', 'borderRadius')).toBe(true);
  });

  test('collapsing nested list rows fades them where they are', async ({ page }) => {
    await openStory(page, 'components-list--expandable');
    const photos = page.getByRole('row', { name: /Photos/ });
    // The nested row's picture while it leaves: it keeps its height and fades out.
    const result = await expectNoMovement(page, {
      parts: { leaving: '[data-exiting]' },
      act: () => photos.click(),
    });
    await expect(page.getByRole('row', { name: /Trips/ })).toHaveCount(0);
    expect(faded(result, 'leaving')).toBe(true);
    for (const frame of result.frames.leaving!) expect(frame.height).toBeGreaterThan(0);
  });

  test('the floating toolbar collapses at once', async ({ page }) => {
    await openStory(page, 'components-toolbar--collapse');
    const toolbar = page.getByTestId('toolbar');
    await expectNoMovement(page, {
      parts: { toolbar },
      act: press(page.getByRole('button', { name: 'Collapse' })),
    });
    expect((await toolbar.boundingBox())!.width).toBe(160);
  });

  test('toolbars leaving on scroll fade where they are', async ({ page }) => {
    await openStory(page, 'components-toolbar--scroll-exit');
    const docked = page.getByTestId('docked');
    const floating = page.getByTestId('floating');
    const result = await expectNoMovement(page, {
      parts: { docked, floating },
      act: () => scrollTo(page, page.getByTestId('scroller'), 200),
    });
    await expect(docked).toHaveAttribute('data-hidden', 'true');
    expect(await opacity(docked)).toBe(0);
    // Re-audit 2026-10-15: `visibility` turned hidden on the first frame, so the fade
    // never showed.
    expect(fadedVisibly(result, 'docked')).toBe(true);
    expect(fadedVisibly(result, 'floating')).toBe(true);
  });
});

test.describe('overlays', () => {
  test('a snackbar fades in and out', async ({ page }) => {
    await openStory(page, 'components-snackbar--host');
    const host = page.getByTestId('host');
    await expectNoMovement(page, {
      parts: { snackbar: '[data-testid="host"] [data-snackbar-id]' },
      act: press(page.getByRole('button', { name: 'With action' })),
    });
    await expect(host.getByText('Message archived')).toBeVisible();
  });

  test('a tooltip fades in', async ({ page }) => {
    await openStory(page, 'components-tooltip--plain');
    const trigger = page.getByRole('button', { name: 'Edit' });
    await page.mouse.move(5, 5);
    await expectNoMovement(page, {
      parts: { tooltip: '[role="tooltip"]' },
      act: () => trigger.hover(),
    });
    await expect(page.getByRole('tooltip')).toBeVisible();
  });

  test('a select’s options fade in and its arrow turns at once', async ({ page }) => {
    await openStory(page, 'components-select--interactive');
    const field = page.getByRole('button', { name: /Sort by/ });
    const arrow = page.getByTestId('interactive').locator('[data-field-state] svg').last();
    await expectNoMovement(page, {
      parts: { listbox: '[role="listbox"]', arrow },
      act: press(field),
    });
    await expect(page.getByRole('listbox')).toBeVisible();
  });
});

test.describe('slider', () => {
  test('a press on the track moves the handle at once', async ({ page }) => {
    await openStory(page, 'components-slider--playground');
    const slider = page.getByTestId('slider');
    const handle = slider.locator('[data-thumb]').first();
    const box = (await slider.boundingBox())!;
    const result = await expectNoMovement(page, {
      parts: { handle },
      act: () => page.mouse.click(box.x + box.width * 0.9, box.y + box.height / 2),
    });
    expect(changed(result, 'handle', 'left')).toBe(true);
  });
});

test.describe('buttons and dialogs', () => {
  test('a button’s press morph snaps', async ({ page }) => {
    await openStory(page, 'components-button--playground');
    const button = page.getByRole('button').first();
    const box = (await button.boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await expectNoMovement(page, { parts: { button }, act: () => page.mouse.down() });
    await expect(button).toHaveAttribute('data-pressed', 'true');
    await page.mouse.up();
  });

  test('a dialog fades in without sliding or unclipping', async ({ page }) => {
    await openStory(page, 'components-dialog--basic');
    await expectNoMovement(page, {
      parts: { dialog: '[role="alertdialog"]' },
      act: press(page.getByRole('button', { name: 'Open dialog' })),
    });
    await expect(page.getByRole('alertdialog', { name: 'Discard draft?' })).toBeVisible();
  });

  test('a menu fades in without unclipping', async ({ page }) => {
    await openStory(page, 'components-menu--single-selection');
    await expectNoMovement(page, {
      parts: { menu: '[role="menu"]' },
      act: press(page.getByRole('button', { name: /Sort by/ })),
    });
    await expect(page.getByRole('menu')).toBeVisible();
  });

  test('a new month fades in without sliding', async ({ page }) => {
    await openStory(page, 'components-pickers--date');
    const picker = page.getByTestId('picker');
    await expectNoMovement(page, {
      parts: { grid: '[data-testid="picker"] [role="grid"]' },
      act: press(picker.getByRole('button', { name: 'Next month' })),
    });
    await expect(picker.getByRole('button', { name: /April 1, 2030/ })).toBeVisible();
  });
});
