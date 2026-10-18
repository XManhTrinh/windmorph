import { expect, test, type Locator, type Page } from '@playwright/test';
import { layoutSafetySuite, OVERRIDES } from './layout-safety';
import { expectKeyboardFocusRing, expectStateLayer, panelLayout } from './overlay-safety';
import { recordTransitions } from './motion';
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
  // Compose: the input rises from below and the calendar comes back down, fading in.
  test('switching to input and back animates the new view in', async ({ page }) => {
    await openStory(page, 'components-pickers--date');
    const input = await recordTransitions(page, '[data-enter="input"] > *');
    await page.getByRole('button', { name: 'Switch to text input mode' }).click();
    await expect(page.getByText('Enter date')).toBeVisible();
    await expect.poll(input).toEqual(expect.arrayContaining(['translate', 'opacity']));
    await settle(page);
    const calendar = await recordTransitions(page, '[data-enter="calendar"] > *');
    await page.getByRole('button', { name: 'Switch to calendar input mode' }).click();
    await expect.poll(calendar).toEqual(expect.arrayContaining(['translate', 'opacity']));
  });

  // Compose's `SizeTransform`: the picker's height moves between the views on the default
  // spatial spring instead of jumping (2026-10-17); reduced motion jumps.
  test('the height follows the view on a spring', async ({ page }) => {
    await openStory(page, 'components-pickers--date');
    const picker = page.locator('[data-tokens~="md-comp-date-picker-modal"][data-mode]').first();
    const sampleHeights = () =>
      picker.evaluate(
        (el) =>
          new Promise<number[]>((resolve) => {
            const heights: number[] = [];
            const start = performance.now();
            const frame = () => {
              heights.push(Math.round(el.getBoundingClientRect().height));
              if (performance.now() - start < 700) requestAnimationFrame(frame);
              else resolve(heights);
            };
            requestAnimationFrame(frame);
          }),
      );
    const calendarHeight = (await rect(picker)).height;
    const sampling = sampleHeights();
    await page.getByRole('button', { name: 'Switch to text input mode' }).click();
    const heights = await sampling;
    const inputHeight = heights.at(-1)!;
    expect(inputHeight).toBeLessThan(calendarHeight - 100);
    // Several heights in between, not one jump.
    const between = heights.filter((h) => h < calendarHeight - 4 && h > inputHeight + 4);
    expect(new Set(between).size).toBeGreaterThan(3);
    // Its inline height goes once the spring ends (a slow runner may still be moving at 700ms).
    await expect.poll(() => picker.evaluate((el) => el.style.height)).toBe('');

    await page.emulateMedia({ reducedMotion: 'reduce' });
    const reduced = sampleHeights();
    await page.getByRole('button', { name: 'Switch to calendar input mode' }).click();
    const jumped = await reduced;
    expect(jumped.filter((h) => h > inputHeight + 4 && h < calendarHeight - 4)).toEqual([]);
  });

  // Compose: the year list expands down (`expandVertically`) as it fades in from 60%.
  test('the year list expands as it fades in', async ({ page }) => {
    await openStory(page, 'components-pickers--date');
    const expanding = await recordTransitions(page, '[role="radiogroup"]');
    await page.getByRole('button', { name: /Switch to selecting a year/ }).click();
    const list = page.getByRole('radiogroup', { name: 'Year' });
    await expect(list).toBeVisible();
    await expect.poll(expanding).toEqual(expect.arrayContaining(['clip-path', 'opacity']));
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

  // M3 recommends the full-screen modal picker on compact windows; at 330px the docked
  // calendar's header was cut off and its day targets overlapped (2026-10-15).
  test('opens the full-screen modal picker on a phone, and Save keeps the day', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 330, height: 620 });
    await openStory(page, 'components-pickers--docked');
    await page.getByRole('button', { name: 'Open calendar' }).click();
    const dialog = page.getByRole('dialog', { name: 'Choose a date' });
    await expect(dialog).toBeVisible();
    await settle(page);
    expect(await rect(dialog)).toEqual({ x: 0, y: 0, width: 330, height: 620 });
    await dialog.getByRole('button', { name: /March 15, 2030/ }).click();
    await dialog.getByRole('button', { name: 'Save' }).click();
    await expect(dialog).toBeHidden();
    await expect(page.getByTestId('value')).toHaveText('Value 2030-03-15');
    await expect(page.getByRole('button', { name: 'Open calendar' })).toBeFocused();
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

  interface HandleFrame {
    /** When it was sampled, against `performance.now()`. */
    time: number;
    x: number;
    y: number;
  }

  interface HandleSampling {
    frames: HandleFrame[];
    pressedAt: number;
    until: number;
    done: () => void;
  }

  /**
   * Starts sampling the handle's centre (in dial units) on every frame, before the press that
   * moves it, so a spring can't run unseen however slow the machine is. `stop(ms)` keeps
   * sampling for `ms` more and until the handle settles, then returns the frames and the time
   * of the last pointer press.
   */
  async function sampleHandle(page: Page) {
    await page.evaluate(() => {
      const handle = document.querySelector(
        'svg[role="group"] [data-slot="clock-dial-selector-handle"]',
      )!;
      const state: HandleSampling = { frames: [], pressedAt: -1, until: Infinity, done: () => {} };
      (window as unknown as { handleSampling: typeof state }).handleSampling = state;
      document.addEventListener(
        'pointerdown',
        () => {
          state.pressedAt = performance.now();
        },
        true,
      );
      const tick = () => {
        state.frames.push({
          time: performance.now(),
          x: Number(handle.getAttribute('cx')),
          y: Number(handle.getAttribute('cy')),
        });
        // Past `until`, it stops once the handle has settled: the same place on three frames.
        const last = state.frames.slice(-3);
        const settled =
          last.length === 3 &&
          last.every((frame) => frame.x === last[0]!.x && frame.y === last[0]!.y);
        if (performance.now() < state.until || !settled) requestAnimationFrame(tick);
        else state.done();
      };
      tick();
    });
    return {
      stop: (ms: number) =>
        page.evaluate(
          (duration) =>
            new Promise<{ frames: HandleFrame[]; pressedAt: number }>((resolve) => {
              const state = (window as unknown as { handleSampling: HandleSampling })
                .handleSampling;
              // The last frame is sampled at least `ms` after this call, once settled.
              state.until = performance.now() + duration;
              state.done = () => resolve({ frames: state.frames, pressedAt: state.pressedAt });
            }),
          ms,
        ),
    };
  }

  // M3 motion: "Spatial springs apply to … rotation"; Compose turns the selector the short way.
  test('the hand turns on a spring along the shortest arc', async ({ page }) => {
    await openStory(page, 'components-pickers--time-12');
    const dial = page.getByRole('group', { name: 'Clock' });
    const box = await rect(dial);
    const cx = box.x + box.width / 2;
    const cy = box.y + box.height / 2;
    // From 2 to 11 o'clock: the short way passes 12 at the top, never the bottom half.
    await page.mouse.move(cx - 101 * Math.sin(Math.PI / 6), cy - 101 * Math.cos(Math.PI / 6));
    const sampling = await sampleHandle(page);
    await page.mouse.down();
    const { frames } = await sampling.stop(400);
    const crossfade = await recordTransitions(page, '*');
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
    await expect.poll(crossfade).toContain('opacity');
  });

  // Compose ends the tap's turn at the spring's 0.01 rad threshold, then holds 100ms; waiting
  // for the spring's full rest held the hour about 0.3s longer (2026-10-17).
  test('a tapped hour switches to minutes 100ms after the hand arrives', async ({ page }) => {
    await openStory(page, 'components-pickers--time-12');
    const box = await rect(page.getByRole('group', { name: 'Clock' }));
    const minute = page.getByRole('textbox', { name: 'Minute' });
    // 4 o'clock, 60° on from the story's 2.
    await page.mouse.move(box.x + 128 + 101 * Math.sin((2 * Math.PI) / 3), box.y + 128 + 101 * 0.5);
    await minute.evaluate((field) => {
      const record = window as unknown as { pressedAt?: number; switchedAt?: number };
      document.addEventListener('pointerdown', () => (record.pressedAt = performance.now()), {
        once: true,
      });
      new MutationObserver((_, observer) => {
        if (field.getAttribute('data-selected') !== 'true') return;
        record.switchedAt = performance.now();
        observer.disconnect();
      }).observe(field, { attributes: true });
    });
    await page.mouse.down();
    await page.mouse.up();
    await expect(minute).toHaveAttribute('data-selected', 'true');
    const elapsed = await page.evaluate(() => {
      const record = window as unknown as { pressedAt: number; switchedAt: number };
      return record.switchedAt - record.pressedAt;
    });
    // The expressive default spatial spring arrives in about 0.3s over 60°, then the 100ms
    // hold; its full rest came at about 0.6s.
    expect(elapsed).toBeGreaterThan(250);
    expect(elapsed).toBeLessThan(520);
  });

  test('reduced motion: the hand jumps', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await openStory(page, 'components-pickers--time-12');
    const box = await rect(page.getByRole('group', { name: 'Clock' }));
    await page.mouse.move(
      box.x + 128 - 101 * Math.sin(Math.PI / 6),
      box.y + 128 - 101 * Math.cos(Math.PI / 6),
    );
    const sampling = await sampleHandle(page);
    await page.mouse.down();
    const { frames, pressedAt } = await sampling.stop(100);
    await page.mouse.up();
    // Every frame after the press already shows 11 o'clock.
    const afterPress = frames.filter((frame) => frame.time > pressedAt);
    expect(pressedAt).toBeGreaterThan(0);
    expect(afterPress.length).toBeGreaterThan(0);
    for (const frame of afterPress) {
      expect(frame.x).toBeCloseTo(128 - 101 * Math.sin(Math.PI / 6), 1);
    }
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
    // The hand turns on a spring that overshoots and comes back, so it passes through 7
    // minutes before it rests there. Wait until it is still across two frames (it ends exactly
    // on the value), then read the handle and the numbers' clip together, in one frame.
    const rest = () =>
      dial.evaluate(async (svg) => {
        const read = () => {
          const at = (selector: string) => {
            const circle = svg.querySelector(selector)!;
            return [Number(circle.getAttribute('cx')), Number(circle.getAttribute('cy'))];
          };
          return {
            handle: at('[data-slot="clock-dial-selector-handle"]'),
            clip: at('clipPath circle'),
          };
        };
        const before = read();
        await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
        const after = read();
        return { ...after, still: before.handle.join() === after.handle.join() };
      });
    // The hand has turned to 7 minutes.
    const seven = 128 + 101 * Math.sin(angle);
    await expect.poll(async () => (await rest()).still).toBe(true);
    const { handle, clip } = await rest();
    expect(handle[0]).toBeCloseTo(seven, 3);
    expect(clip).toEqual(handle);
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

  // The page's `dir` with an English locale: AM / PM follow the page, not only the locale.
  test('AM and PM follow a right-to-left page inside the left-to-right time', async ({ page }) => {
    await openStory(page, 'components-pickers--time-12', { dir: 'rtl' });
    await expect(page.getByRole('radiogroup', { name: 'AM or PM' })).toHaveAttribute('dir', 'rtl');
    await openStory(page, 'components-pickers--time-12');
    await expect(page.getByRole('radiogroup', { name: 'AM or PM' })).toHaveAttribute('dir', 'ltr');
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

test.describe('DateField layout safety', () => {
  for (const override of OVERRIDES) {
    for (const transformedAncestor of [false, true]) {
      for (const dir of ['ltr', 'rtl'] as const) {
        test(`${override}${transformedAncestor ? ' · transformed ancestor' : ''} · ${dir}`, async ({
          page,
        }) => {
          await openStory(
            page,
            'components-pickers--date-field-layout-override',
            { dir },
            { override, transformedAncestor },
          );
          const field = page.getByTestId('target');
          const container = field.locator('div').first();
          expect(await container.evaluate((el) => (el as HTMLElement).offsetHeight)).toBe(56);
          if (override !== 'fullWidth') {
            expect(await field.evaluate((el) => (el as HTMLElement).offsetWidth)).toBe(280);
          }
          // The calendar opens in the window, 360px wide, and a day saves.
          await page.getByRole('button', { name: 'Open calendar' }).click();
          const calendar = page.getByRole('dialog', { name: 'Choose a date' });
          await expect(page.getByRole('button', { name: /March 14, 2030/ })).toBeFocused();
          await settle(page);
          const panel = await rect(calendar);
          const viewport = page.viewportSize()!;
          expect(panel.width).toBe(360);
          expect(panel.x).toBeGreaterThanOrEqual(0);
          expect(panel.y).toBeGreaterThanOrEqual(0);
          expect(panel.x + panel.width).toBeLessThanOrEqual(viewport.width);
          expect(panel.y + panel.height).toBeLessThanOrEqual(viewport.height);
          // The next day: → in left to right, ← in right to left.
          await page.keyboard.press(dir === 'ltr' ? 'ArrowRight' : 'ArrowLeft');
          await page.keyboard.press('Enter');
          await expect(calendar).toBeHidden();
          await expect(page.getByTestId('value')).toHaveText('Value 2030-03-15');
        });
      }
    }
  }
});

test.describe('Picker dialogs in short windows (2026-10-13)', () => {
  /**
   * The dialog's content (the picker's scroll area) and actions row, measured after the
   * content is scrolled to its end: how far the picker reaches over the actions where it
   * isn't clipped, whether the content scrolls, and where the actions and panel sit.
   */
  const layout = (dialog: Locator) =>
    dialog.getByRole('button', { name: 'OK' }).evaluate((ok) => {
      const actions = ok.closest('[class*="justify-between"]')!;
      const content = actions.previousElementSibling as HTMLElement;
      const picker = content.firstElementChild!;
      const style = getComputedStyle(content);
      const scrollable = style.overflowY === 'auto' || style.overflowY === 'scroll';
      content.scrollTop = content.scrollHeight;
      const actionsBox = actions.getBoundingClientRect();
      const panel = actions.parentElement!.getBoundingClientRect();
      // What shows of the picker: clipped to the content when it scrolls.
      const shownBottom = scrollable
        ? Math.min(picker.getBoundingClientRect().bottom, content.getBoundingClientRect().bottom)
        : picker.getBoundingClientRect().bottom;
      // Scrolled to its end, the whole picker (its last row of days, or the range picker's
      // month list) sits above the actions.
      const pickerBottom = picker.getBoundingClientRect().bottom;
      return {
        scrolls: scrollable && content.scrollHeight > content.clientHeight,
        overlap: Math.max(0, Math.round(shownBottom - actionsBox.top)),
        pickerAboveActions: pickerBottom <= actionsBox.top + 0.5,
        actionsInPanel: actionsBox.bottom <= panel.bottom + 0.5,
        panelInWindow: panel.top >= 0 && panel.bottom <= window.innerHeight + 0.5,
      };
    });

  const cases = [
    { name: '720px window at a 32px root', width: 1280, height: 720, root: 32 },
    { name: '480px window at the default root', width: 1024, height: 480, root: 16 },
  ];
  const pickers = [
    { story: 'components-pickers--date-dialog', open: 'Pick a date', title: 'Select date' },
    { story: 'components-pickers--date-range-dialog', open: 'Pick dates', title: 'Select dates' },
  ];

  for (const { name, width, height, root } of cases) {
    for (const { story, open, title } of pickers) {
      test(`${title}: the calendar scrolls above the actions · ${name}`, async ({ page }) => {
        await page.setViewportSize({ width, height });
        await openStory(page, story);
        await page.addStyleTag({ content: `html { font-size: ${root}px; }` });
        await page.getByRole('button', { name: open }).click();
        const dialog = page.getByRole('dialog', { name: title });
        await expect(dialog).toBeVisible();
        await settle(page);
        expect(await layout(dialog)).toEqual({
          scrolls: true,
          overlap: 0,
          pickerAboveActions: true,
          actionsInPanel: true,
          panelInWindow: true,
        });
        await expect(dialog.getByRole('button', { name: 'Cancel' })).toBeInViewport();
        await expect(dialog.getByRole('button', { name: 'OK' })).toBeInViewport();
        await dialog.getByRole('button', { name: 'OK' }).click();
        await expect(dialog).toBeHidden();
      });
    }
  }
});

test.describe('TimePicker layout safety', () => {
  layoutSafetySuite('components-pickers--time-layout-override', {
    // The 80px selectors, then the 256px dial 36px below; the selectors and the 52px
    // period selector 12px beside them set the width.
    height: 372,
    width: 280,
    radius: '0px',
    interactive: false,
    async check(page, target) {
      await target.getByRole('radio', { name: 'AM' }).click();
      await expect(page.getByTestId('count')).toHaveText('Value 02:35:00');
    },
  });
});

test.describe('PickerDialog layout safety', () => {
  /**
   * Opens the dialog from its button: it takes focus, sits in the window at 360px with
   * 28px corners, and Cancel closes it and returns focus to the button.
   */
  async function openAndCancel(page: Page, override: string) {
    const target = page.getByTestId('target');
    await target.click();
    const dialog = page.getByRole('dialog', { name: 'Select date' });
    await expect(dialog).toBeVisible();
    await expect
      .poll(() => dialog.evaluate((el) => el.contains(document.activeElement)))
      .toBe(true);
    await settle(page);
    const panel = await panelLayout(dialog);
    expect(panel).toMatchObject({ radius: '28px', inWindow: true, onTop: true });
    if (override !== 'fullWidth') expect(panel.width).toBe(360);
    await dialog.getByRole('button', { name: 'Cancel' }).click();
    await expect(dialog).toHaveCount(0);
    await expect(target).toBeFocused();
  }

  // The button that opens it keeps its size, corners, state layer and focus ring.
  layoutSafetySuite('components-pickers--dialog-layout-override', {
    height: 40,
    radius: '20px',
    interactive: false,
    directions: ['ltr'],
    async check(page, target) {
      await expectStateLayer(target);
      await expectKeyboardFocusRing(page, target);
      await openAndCancel(page, 'none');
    },
  });

  // A layout class on the dialog (`className`, on its outermost element).
  for (const override of OVERRIDES) {
    test(`panel · ${override}`, async ({ page }) => {
      await openStory(
        page,
        'components-pickers--dialog-layout-override',
        {},
        { override, part: 'panel' },
      );
      await openAndCancel(page, override);
    });
  }
});
