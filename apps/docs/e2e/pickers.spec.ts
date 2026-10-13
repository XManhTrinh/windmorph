import { expect, test, type Locator, type Page } from '@playwright/test';
import { layoutSafetySuite } from './layout-safety';
import { MODES, THEMES } from './shots';
import { openStory } from './story';

const rect = (locator: Locator) =>
  locator.evaluate((el) => {
    const r = el.getBoundingClientRect();
    return {
      x: Math.round(r.x),
      y: Math.round(r.y),
      width: Math.round(r.width),
      height: Math.round(r.height),
    };
  });

/** A colour role resolved where `locator` is (inside its theme scope), as `rgb()`. */
const roleColor = (locator: Locator, role: string) =>
  locator.evaluate((el, name) => {
    const probe = document.createElement('span');
    probe.style.color = `var(--md-sys-color-${name})`;
    el.append(probe);
    const color = getComputedStyle(probe).color;
    probe.remove();
    return color;
  }, role);

const settle = (page: Page) =>
  page.evaluate(() =>
    Promise.allSettled(document.getAnimations().map((a) => a.finished)).then(() => undefined),
  );

test.describe('Pickers visual regression', () => {
  for (const theme of THEMES) {
    for (const mode of MODES) {
      test(`date · ${theme} · ${mode}`, async ({ page }) => {
        await openStory(page, 'components-pickers--date', { theme, mode });
        await expect(page.getByTestId('picker')).toHaveScreenshot(`date-${theme}-${mode}.png`);
      });
    }
  }

  for (const story of [
    'date-input',
    'date-range',
    'time-12',
    'time-24',
    'time-horizontal',
    'time-input',
  ] as const) {
    test(story, async ({ page }) => {
      await openStory(page, `components-pickers--${story}`);
      await expect(page.getByTestId('picker')).toHaveScreenshot(`${story}.png`);
    });
  }

  for (const dir of ['ltr', 'rtl'] as const) {
    test(`date range · ${dir}`, async ({ page }) => {
      await openStory(page, 'components-pickers--date-range', { dir });
      await expect(page.getByTestId('picker')).toHaveScreenshot(`date-range-${dir}.png`);
    });
  }

  test('docked', async ({ page }) => {
    await openStory(page, 'components-pickers--docked');
    await page.getByRole('button', { name: 'Open calendar' }).click();
    const calendar = page.getByRole('dialog', { name: 'Choose a date' });
    await expect(calendar).toBeVisible();
    await settle(page);
    await page.mouse.move(0, 0);
    await expect(page).toHaveScreenshot('docked.png', {
      clip: { x: 0, y: 0, width: 420, height: 560 },
    });
  });

  test('date range full screen', async ({ page }) => {
    await page.setViewportSize({ width: 412, height: 800 });
    await openStory(page, 'components-pickers--date-range-full-screen');
    await expect(page.getByRole('dialog')).toBeVisible();
    await settle(page);
    await expect(page).toHaveScreenshot('date-range-full-screen.png');
  });

  test('time dialog', async ({ page }) => {
    await openStory(page, 'components-pickers--time-dialog');
    await expect(page.getByRole('dialog')).toBeVisible();
    await settle(page);
    await expect(page.getByRole('dialog')).toHaveScreenshot('time-dialog.png');
  });
});

test.describe('Date picker', () => {
  test('follows Compose geometry with 48px day targets', async ({ page }) => {
    await openStory(page, 'components-pickers--date');
    const picker = page.getByTestId('picker');
    expect(await rect(picker)).toMatchObject({ width: 360, height: 512 });
    const day = page.getByRole('button', { name: /March 14, 2030/ });
    const box = await rect(day);
    expect(box).toMatchObject({ width: 40, height: 40 });
    const next = page.getByRole('button', { name: /March 15, 2030/ });
    expect((await rect(next)).x - box.x).toBe(48);
    // The 4px around the circle still hit the day: the target fills the 48px cell.
    const hit = await page.evaluate(
      ([x, y]) => document.elementFromPoint(x!, y!)?.textContent,
      [box.x - 3, box.y - 3],
    );
    expect(hit).toBe('14');
  });

  test('keyboard moves through the days and selects', async ({ page }) => {
    await openStory(page, 'components-pickers--date');
    await page.getByRole('button', { name: /March 14, 2030/ }).focus();
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
    await expect(page.getByTestId('value')).toHaveText('Value 2030-03-22');
  });

  test('the dialog confirms the picked date, and Enter closes and saves', async ({ page }) => {
    await openStory(page, 'components-pickers--date-dialog');
    await page.getByRole('button', { name: 'Pick a date' }).click();
    const dialog = page.getByRole('dialog', { name: 'Select date' });
    await dialog.getByRole('button', { name: /March 20, 2030/ }).click();
    await dialog.getByRole('button', { name: 'OK' }).click();
    await expect(dialog).toBeHidden();
    await expect(page.getByTestId('value')).toHaveText('Value 2030-03-20');
    await page.getByRole('button', { name: 'Pick a date' }).click();
    await dialog.getByRole('button', { name: /March 20, 2030/ }).focus();
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('Enter');
    await expect(dialog).toBeHidden();
    await expect(page.getByTestId('value')).toHaveText('Value 2030-03-21');
  });

  test('the dialog fills a compact window', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 780 });
    await openStory(page, 'components-pickers--date-dialog');
    await page.getByRole('button', { name: 'Pick a date' }).click();
    const dialog = page.getByRole('dialog', { name: 'Select date' });
    await settle(page);
    expect(await rect(dialog)).toMatchObject({ x: 0, y: 0, width: 390, height: 780 });
    // M3: the date picker's `surface-container-high` container and the full-screen dialog's
    // 56px top row, with an `on-surface` close icon.
    expect(await dialog.evaluate((el) => getComputedStyle(el).backgroundColor)).toBe(
      await roleColor(dialog, 'surface-container-high'),
    );
    const close = dialog.getByRole('button', { name: 'Close' });
    expect((await rect(close.locator('xpath=..'))).height).toBe(56);
    expect(await close.evaluate((el) => getComputedStyle(el).color)).toBe(
      await roleColor(dialog, 'on-surface'),
    );
    await dialog.getByRole('button', { name: /March 20, 2030/ }).click();
    await dialog.getByRole('button', { name: 'Save' }).click();
    await expect(dialog).toBeHidden();
    await expect(page.getByTestId('value')).toHaveText('Value 2030-03-20');
  });

  test('the typed date reformats on Enter', async ({ page }) => {
    await openStory(page, 'components-pickers--date-input');
    const field = page.getByRole('textbox', { name: 'Date' });
    await field.fill('4.2.2030');
    await field.press('Enter');
    await expect(field).toHaveValue('04/02/2030');
    await expect(page.getByTestId('value')).toHaveText('Value 2030-04-02');
  });

  // The range band follows a nested theme scope (it used `--color-*`, which resolves once at
  // the root, so a dark scope kept the root's light band).
  test('the range band follows a dark theme scope', async ({ page }) => {
    await openStory(page, 'components-pickers--date-range');
    const picker = page.getByTestId('picker');
    await picker.evaluate((el) => {
      const root = document.querySelector('[data-mode]') ?? document.documentElement;
      for (const name of root.getAttributeNames().filter((n) => n.startsWith('data-'))) {
        el.setAttribute(name, root.getAttribute(name)!);
      }
      el.setAttribute('data-mode', 'dark');
    });
    const band = picker.locator('[data-range="middle"]').first();
    const image = await band.evaluate((el) => getComputedStyle(el).backgroundImage);
    expect(image).toContain(await roleColor(band, 'secondary-container'));
    expect(await roleColor(band, 'secondary-container')).not.toBe(
      await roleColor(page.locator('body'), 'secondary-container'),
    );
  });

  test('the range picker scrolls through the months', async ({ page }) => {
    await openStory(page, 'components-pickers--date-range');
    const picker = page.getByTestId('picker');
    expect(await rect(picker)).toMatchObject({ width: 360, height: 520 });
    const april = page.getByRole('button', { name: /April 2, 2030/ });
    await page.getByRole('button', { name: /March 20, 2030/ }).hover();
    await page.mouse.wheel(0, 400);
    await expect(april).toBeInViewport();
    await april.click();
    await page.getByRole('button', { name: /April 5, 2030/ }).click();
    await expect(page.getByText('Apr 2 – Apr 5')).toBeVisible();
  });
});

test.describe('Date picker motion', () => {
  /** The CSS transitions running on elements matching `selector`, by property. */
  const transitions = (page: Page, selector: string) =>
    page.evaluate(
      (sel) =>
        [...document.querySelectorAll(sel)].flatMap((el) =>
          el.getAnimations().map((a) => (a as CSSTransition).transitionProperty),
        ),
      selector,
    );

  // Compose: the input rises from below and the calendar comes back down, fading in.
  test('switching to input and back animates the new view in', async ({ page }) => {
    await openStory(page, 'components-pickers--date');
    await page.getByRole('button', { name: 'Switch to text input mode' }).click();
    await expect(page.getByText('Enter date')).toBeVisible();
    expect(await transitions(page, '[data-enter="input"] > *')).toEqual(
      expect.arrayContaining(['translate', 'opacity']),
    );
    await settle(page);
    await page.getByRole('button', { name: 'Switch to calendar input mode' }).click();
    expect(await transitions(page, '[data-enter="calendar"] > *')).toEqual(
      expect.arrayContaining(['translate', 'opacity']),
    );
  });

  // Compose: the year list expands down (`expandVertically`) as it fades in from 60%.
  test('the year list expands as it fades in', async ({ page }) => {
    await openStory(page, 'components-pickers--date');
    await page.getByRole('button', { name: /Switch to selecting a year/ }).click();
    const list = page.getByRole('radiogroup', { name: 'Year' });
    await expect(list).toBeVisible();
    expect(await transitions(page, '[role="radiogroup"]')).toEqual(
      expect.arrayContaining(['clip-path', 'opacity']),
    );
    await settle(page);
    expect(await list.evaluate((el) => getComputedStyle(el).clipPath)).toBe('inset(0px)');
  });

  test('the full-screen range header drops to its content under the top row', async ({ page }) => {
    await page.setViewportSize({ width: 412, height: 800 });
    await openStory(page, 'components-pickers--date-range-full-screen');
    const dialog = page.getByRole('dialog');
    await settle(page);
    const header = dialog.getByText('Select dates').locator('..');
    // The 128px minimum less the 60px top-row offset (Compose): 68px, so the header is
    // as tall as its title and headline row.
    expect(await header.evaluate((el) => getComputedStyle(el).minHeight)).toBe('68px');
    expect((await rect(header)).height).toBeLessThan(128);
  });
});

test.describe('Docked date picker', () => {
  // M3 menus: while its list is open, the button keeps a pressed state layer.
  test('the month menu button shows a pressed layer while its list is open', async ({ page }) => {
    await openStory(page, 'components-pickers--docked');
    await page.getByRole('button', { name: 'Open calendar' }).click();
    const calendar = page.getByRole('dialog', { name: 'Choose a date' });
    const month = calendar.getByRole('button', { name: /Choose a month/ });
    const opacity = () =>
      month.evaluate((el) => getComputedStyle(el).getPropertyValue('--m3-open-opacity'));
    await month.click();
    await expect(month).toHaveAttribute('data-menu-open', 'true');
    await expect.poll(async () => parseFloat(await opacity())).toBe(0.1);
  });

  test('opens below the field, 360px wide, and Enter saves', async ({ page }) => {
    await openStory(page, 'components-pickers--docked');
    const field = page.getByRole('textbox', { name: 'Date' });
    await page.getByRole('button', { name: 'Open calendar' }).click();
    const calendar = page.getByRole('dialog', { name: 'Choose a date' });
    await expect(page.getByRole('button', { name: /March 14, 2030/ })).toBeFocused();
    await settle(page);
    const panel = await rect(calendar);
    expect(panel.width).toBe(360);
    expect(panel.y).toBeGreaterThan((await rect(field)).y);
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('Enter');
    await expect(calendar).toBeHidden();
    await expect(field).toHaveValue('03/15/2030');
    await expect(page.getByTestId('value')).toHaveText('Value 2030-03-15');
  });
});

test.describe('Time picker', () => {
  test('dragging the dial sets the hour then switches to minutes', async ({ page }) => {
    await openStory(page, 'components-pickers--time-12');
    const dial = page.getByRole('group', { name: 'Clock' });
    const box = await rect(dial);
    const cx = box.x + box.width / 2;
    const cy = box.y + box.height / 2;
    // 3 o'clock: straight right of the centre on the outer ring.
    await page.mouse.move(cx + 101, cy);
    await page.mouse.down();
    await page.mouse.up();
    await expect(page.getByTestId('value')).toHaveText('Value 15:35:00');
    await expect(page.getByRole('textbox', { name: 'Minute' })).toHaveAttribute(
      'data-selected',
      'true',
    );
    // 6 o'clock on the minute face: 30 minutes.
    await page.mouse.click(cx, cy + 101);
    await expect(page.getByTestId('value')).toHaveText('Value 15:30:00');
  });

  /** The handle's centre in dial units, every frame for `ms`. */
  const sampleHandle = (page: Page, ms: number) =>
    page.evaluate((duration) => {
      const handle = document.querySelector('svg[role="group"] circle.fill-primary[r="24"]')!;
      const frames: { x: number; y: number }[] = [];
      const start = performance.now();
      return new Promise<typeof frames>((resolve) => {
        const tick = () => {
          frames.push({
            x: Number(handle.getAttribute('cx')),
            y: Number(handle.getAttribute('cy')),
          });
          if (performance.now() - start < duration) requestAnimationFrame(tick);
          else resolve(frames);
        };
        tick();
      });
    }, ms);

  // M3 motion: "Spatial springs apply to … rotation"; Compose turns the selector the short way.
  test('the hand turns on a spring along the shortest arc', async ({ page }) => {
    await openStory(page, 'components-pickers--time-12');
    const dial = page.getByRole('group', { name: 'Clock' });
    const box = await rect(dial);
    const cx = box.x + box.width / 2;
    const cy = box.y + box.height / 2;
    // From 2 to 11 o'clock: the short way passes 12 at the top, never the bottom half.
    await page.mouse.move(cx - 101 * Math.sin(Math.PI / 6), cy - 101 * Math.cos(Math.PI / 6));
    await page.mouse.down();
    const frames = await sampleHandle(page, 400);
    await page.mouse.up();
    const end = frames.at(-1)!;
    expect(end.x).toBeCloseTo(128 - 101 * Math.sin(Math.PI / 6), 0);
    // It starts at 2 o'clock and moves through more than two positions on the way.
    expect(frames[0]!.x).toBeGreaterThan(128);
    expect(new Set(frames.map((f) => Math.round(f.x))).size).toBeGreaterThan(4);
    expect(Math.max(...frames.map((f) => f.y))).toBeLessThan(128);
    // Releasing on the hour face crossfades to the minute face.
    await expect(page.getByRole('textbox', { name: 'Minute' })).toHaveAttribute(
      'data-selected',
      'true',
    );
    expect(
      await page.evaluate(() =>
        document
          .getAnimations()
          .some((a) => a instanceof CSSTransition && a.transitionProperty === 'opacity'),
      ),
    ).toBe(true);
  });

  test('reduced motion: the hand jumps', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await openStory(page, 'components-pickers--time-12');
    const box = await rect(page.getByRole('group', { name: 'Clock' }));
    await page.mouse.move(
      box.x + 128 - 101 * Math.sin(Math.PI / 6),
      box.y + 128 - 101 * Math.cos(Math.PI / 6),
    );
    await page.mouse.down();
    const frames = await sampleHandle(page, 100);
    await page.mouse.up();
    // Every frame already shows 11 o'clock.
    for (const frame of frames) expect(frame.x).toBeCloseTo(128 - 101 * Math.sin(Math.PI / 6), 1);
  });

  test('minute taps snap to five; the numbers under the handle are on-primary', async ({
    page,
  }) => {
    await openStory(page, 'components-pickers--time-12');
    await page.getByRole('textbox', { name: 'Minute' }).focus();
    const dial = page.getByRole('group', { name: 'Clock' });
    const box = await rect(dial);
    // 7 minutes: 42° clockwise from 12.
    const angle = (7 / 60) * 2 * Math.PI;
    await page.mouse.click(
      box.x + 128 + 101 * Math.sin(angle),
      box.y + 128 - 101 * Math.cos(angle),
    );
    await expect(page.getByTestId('value')).toHaveText('Value 14:05:00');
    // Typed minutes stay exact, and the handle half covers "05": its covered part is on-primary.
    const minute = page.getByRole('textbox', { name: 'Minute' });
    await minute.fill('07');
    await expect(page.getByTestId('value')).toHaveText('Value 14:07:00');
    await settle(page);
    const copy = dial.locator('g[clip-path] text', { hasText: '05' });
    expect(await copy.evaluate((el) => getComputedStyle(el).fill)).toBe(
      await roleColor(dial, 'on-primary'),
    );
    const centre = (selector: string) =>
      dial
        .locator(selector)
        .evaluate((el) => [Number(el.getAttribute('cx')), Number(el.getAttribute('cy'))]);
    // The hand has turned to 7 minutes.
    const seven = 128 + 101 * Math.sin(angle);
    await expect
      .poll(async () => (await centre('circle.fill-primary[r="24"]'))[0])
      .toBeCloseTo(seven, 3);
    const clip = await centre('clipPath circle');
    const handle = await centre('circle.fill-primary[r="24"]');
    expect(clip[0]).toBeCloseTo(handle[0]!, 3);
    expect(clip[1]).toBeCloseTo(handle[1]!, 3);
  });

  test('a press within 74px of the centre picks the inner 24-hour ring', async ({ page }) => {
    await openStory(page, 'components-pickers--time-24');
    const box = await rect(page.getByRole('group', { name: 'Clock' }));
    const hour = page.getByRole('textbox', { name: 'Hour' });
    await page.mouse.click(box.x + 128 + 78, box.y + 128);
    await expect(hour).toHaveValue('03');
    await hour.focus();
    await page.mouse.click(box.x + 128 + 70, box.y + 128);
    await expect(hour).toHaveValue('15');
  });

  test('selectors show hover and pressed state layers', async ({ page }) => {
    await openStory(page, 'components-pickers--time-12');
    const minute = page.getByRole('textbox', { name: 'Minute' });
    const layer = () =>
      minute.evaluate((el) => getComputedStyle(el).getPropertyValue('--m3-state-opacity'));
    const rest = await layer();
    await minute.hover();
    await expect(minute).toHaveAttribute('data-hovered', 'true');
    await expect.poll(layer).not.toBe(rest);
    await page.mouse.down();
    await expect(minute).toHaveAttribute('data-pressed', 'true');
    await expect.poll(layer).toBe('0.1');
    await page.mouse.up();
  });

  test('the time reads left to right in a right-to-left layout', async ({ page }) => {
    await openStory(page, 'components-pickers--time-12', { dir: 'rtl' });
    const x = (name: string) => rect(page.getByRole('textbox', { name })).then((r) => r.x);
    const am = await rect(page.getByRole('radio', { name: 'AM' }));
    expect(await x('Hour')).toBeLessThan(await x('Minute'));
    expect(await x('Minute')).toBeLessThan(am.x);
  });

  test('the dial numbers are 48px buttons you can Tab to and press', async ({ page }) => {
    await openStory(page, 'components-pickers--time-12');
    const two = page.getByRole('button', { name: '2 hours of 12', exact: true });
    expect(await rect(two)).toMatchObject({ width: 48, height: 48 });
    await page.getByRole('radio', { name: 'PM' }).focus();
    await page.keyboard.press('Tab');
    await expect(two).toBeFocused();
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('Enter');
    await expect(page.getByTestId('value')).toHaveText('Value 15:35:00');
    await expect(page.getByRole('button', { name: '35 minutes of 60' })).toBeFocused();
  });

  test('selectors and dial follow Compose sizes', async ({ page }) => {
    await openStory(page, 'components-pickers--time-12');
    expect(await rect(page.getByRole('textbox', { name: 'Hour' }))).toMatchObject({
      width: 96,
      height: 80,
    });
    expect(await rect(page.getByRole('group', { name: 'Clock' }))).toMatchObject({
      width: 256,
      height: 256,
    });
    expect(await rect(page.getByRole('radiogroup', { name: 'AM or PM' }))).toMatchObject({
      width: 52,
      height: 80,
    });
  });

  test('24-hour input fields are 96px wide', async ({ page }) => {
    await openStory(page, 'components-pickers--time-input');
    const hour = page.getByTestId('picker-24').getByRole('textbox', { name: 'Hour' });
    expect(await rect(hour)).toMatchObject({ width: 96, height: 72 });
  });

  test('the horizontal layout puts the dial beside a 216 × 38px period selector', async ({
    page,
  }) => {
    await openStory(page, 'components-pickers--time-horizontal');
    const period = await rect(page.getByRole('radiogroup', { name: 'AM or PM' }));
    expect(period).toMatchObject({ width: 216, height: 38 });
    const dial = await rect(page.getByRole('group', { name: 'Clock' }));
    expect(dial.x - (period.x + period.width)).toBe(36);
  });

  test('the dialog never scrolls: horizontal on short windows, input with no room', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 800, height: 500 });
    await openStory(page, 'components-pickers--time-dialog');
    const dialog = page.getByRole('dialog');
    await expect(dialog.getByRole('group', { name: 'Clock' })).toBeVisible();
    const noScroll = () => dialog.evaluate((el) => el.scrollHeight <= el.clientHeight);
    expect(await noScroll()).toBe(true);
    await page.setViewportSize({ width: 500, height: 420 });
    await expect(dialog.getByRole('group', { name: 'Clock' })).toBeHidden();
    await expect(dialog.getByRole('textbox', { name: 'Hour' })).toBeVisible();
    await expect(dialog.getByRole('button', { name: 'Toggle input picker' })).toBeHidden();
    expect(await noScroll()).toBe(true);
  });
});

test.describe('Pickers layout safety', () => {
  layoutSafetySuite('components-pickers--layout-override', {
    height: 512,
    width: 360,
    radius: '0px',
    interactive: false,
  });
});
