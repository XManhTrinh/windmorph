import { expect, test, type Page } from '@playwright/test';
import { layoutSafetySuite } from './layout-safety';
import { pauseClock } from './clock';
import { indicatorContrasts, layoutBoxes, pendingCheck, waitForIndicators } from './pending';
import { expectNoMovement } from './reduced-motion';
import { MODES, THEMES, shotWithMargin } from './shots';
import { systemColor, underForcedColors } from './forced-colors';
import { overshoots, probeNextMorph } from './morph-probe';
import { openStory } from './story';

test.describe('Button visual regression', () => {
  for (const theme of THEMES) {
    for (const mode of MODES) {
      test(`variants · ${theme} · ${mode}`, async ({ page }) => {
        await openStory(page, 'components-button--variants', { theme, mode });
        await expect(page.getByTestId('variants')).toHaveScreenshot(
          `variants-${theme}-${mode}.png`,
        );
      });
    }
  }

  for (const contrast of ['medium', 'high'] as const) {
    for (const mode of MODES) {
      test(`variants · baseline · ${mode} · ${contrast} contrast`, async ({ page }) => {
        await openStory(page, 'components-button--variants', { mode, contrast });
        await expect(page.getByTestId('variants')).toHaveScreenshot(
          `variants-baseline-${mode}-${contrast}.png`,
        );
      });
    }
  }

  test('sizes and shapes', async ({ page }) => {
    await openStory(page, 'components-button--sizes-and-shapes');
    await expect(page.getByTestId('sizes')).toHaveScreenshot('sizes-and-shapes.png');
  });

  test('sizes and shapes · rtl', async ({ page }) => {
    await openStory(page, 'components-button--sizes-and-shapes', { dir: 'rtl' });
    await expect(page.getByTestId('sizes')).toHaveScreenshot('sizes-and-shapes-rtl.png');
  });
});

test.describe('Button interaction states', () => {
  test('hover, focus and press', async ({ page }) => {
    await openStory(page, 'components-button--playground', {}, { size: 'md' });
    const button = page.getByRole('button', { name: 'Button' });

    await button.hover();
    await expect(button).toHaveAttribute('data-hovered', 'true');
    await shotWithMargin(page, button, 'state-hover.png');

    await page.mouse.move(0, 0);
    await page.keyboard.press('Tab');
    await expect(button).toHaveAttribute('data-focus-visible', 'true');
    await shotWithMargin(page, button, 'state-focus.png');

    const box = (await button.boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await expect(button).toHaveAttribute('data-pressed', 'true');
    // Pressed corners morph from full to medium (12px) on the fast spatial spring.
    await expect
      .poll(() => button.evaluate((el) => getComputedStyle(el).borderTopLeftRadius))
      .toBe('12px');
    await page.mouse.up();
    await expect(button).not.toHaveAttribute('data-pressed');
    await expect
      .poll(() => button.evaluate((el) => getComputedStyle(el).borderTopLeftRadius))
      .toBe('28px');
  });

  /** A corner-radius transition's curve: where it starts, and its extremes. */
  interface MorphCurve {
    from: number;
    min: number;
    max: number;
  }

  // Re-audit 2026-10-15: a plain button's press morph overshot; Compose's Button uses
  // DefaultEffects, which never bounces. Toggles keep the fast spatial spring.
  test('a plain button presses without bouncing', async ({ page }) => {
    await openStory(page, 'components-button--playground', {}, { size: 'md' });
    const button = page.getByRole('button', { name: 'Button' });
    const box = (await button.boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    const press = await probeNextMorph(button, 'press');
    await page.mouse.down();
    const curve = await press();
    expect(curve.from).toBeGreaterThan(curve.to);
    expect(overshoots(curve), JSON.stringify(curve)).toBe(false);
    await page.mouse.up();
  });

  test('a toggle’s press morph bounces on the fast spatial spring, but not on a rapid re-press', async ({
    page,
  }) => {
    // A medium round toggle ("Star", "Starred" once selected).
    await openStory(page, 'components-button--toggle');
    const button = page.getByRole('button').first();
    /**
     * Probes the next corner-radius transition as it starts: paused, read at 100 points along
     * its whole timeline and resumed where it was, so the spring's full curve is seen however
     * few frames a loaded machine renders. Call it before the press that starts the morph;
     * the returned function gives the radius it starts from and the smallest and largest.
     */
    const probeNextMorph = async () => {
      await button.evaluate((el: HTMLElement) => {
        const store = window as unknown as { morph?: MorphCurve };
        delete store.morph;
        const onRun = (event: TransitionEvent) => {
          // The press's own morph: a transition can also restart before it (the release's,
          // when its duration changes back), and that one isn't probed.
          if (
            event.target !== el ||
            event.propertyName !== 'border-top-left-radius' ||
            !el.hasAttribute('data-pressed')
          ) {
            return;
          }
          el.removeEventListener('transitionrun', onRun);
          const transition = el
            .getAnimations()
            .find(
              (animation) =>
                (animation as CSSTransition).transitionProperty === 'border-top-left-radius',
            )!;
          const resumeAt = transition.currentTime ?? 0;
          transition.pause();
          const end = Number(transition.effect!.getComputedTiming().endTime);
          const radii = Array.from({ length: 101 }, (_, step) => {
            transition.currentTime = (end * step) / 100;
            return parseFloat(getComputedStyle(el).borderTopLeftRadius);
          });
          transition.currentTime = resumeAt;
          transition.play();
          store.morph = { from: radii[0]!, min: Math.min(...radii), max: Math.max(...radii) };
        };
        el.addEventListener('transitionrun', onRun);
      });
      return async () => {
        const read = () => page.evaluate(() => (window as unknown as { morph?: MorphCurve }).morph);
        await expect.poll(read).not.toBeUndefined();
        return (await read())!;
      };
    };
    const box = (await button.boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);

    const pressMorph = await probeNextMorph();
    await page.mouse.down();
    // 28px → 12px overshoots below 12px before settling (expressive scheme).
    expect((await pressMorph()).min).toBeLessThan(11.5);
    // The release morph runs over 20s instead of 360ms, so it's still early (and far from its
    // overshoot) when it's read and when the next press lands, however loaded the machine is.
    // Changing the duration back doesn't touch the running transition, so the re-press below
    // gets the real effects spring.
    await button.evaluate((el) => el.style.setProperty('--m3-shape-duration', '20s'));
    await page.mouse.up();
    const midRelease = await button.evaluate(async (el) => {
      const radius = () => parseFloat(getComputedStyle(el).borderTopLeftRadius);
      while (radius() <= 12.5) await new Promise(requestAnimationFrame);
      el.style.removeProperty('--m3-shape-duration');
      return radius();
    });
    expect(midRelease).toBeGreaterThan(12.5);
    expect(midRelease).toBeLessThan(27.5);
    const rapidPressMorph = await probeNextMorph();
    await page.mouse.down();
    await expect(button).toHaveAttribute('data-rapid-press', '');
    // A press that overlaps the release morph picks up where it is, on the non-bouncing
    // effects spring.
    const range = await rapidPressMorph();
    // It starts from the release's current radius (which kept growing since it was read),
    // not from the rest or pressed corners, and never rises above it or dips below 12px.
    expect(range.from).toBeGreaterThanOrEqual(midRelease - 0.5);
    expect(range.from).toBeLessThan(27.5);
    expect(range.max).toBeLessThanOrEqual(range.from + 0.5);
    expect(range.min).toBeGreaterThanOrEqual(11.9);
    await page.mouse.up();
  });

  test('toggle selection swaps the shape', async ({ page }) => {
    await openStory(page, 'components-button--toggle');
    const toggle = page.getByRole('button', { name: 'Star' });
    await toggle.click();
    const starred = page.getByRole('button', { name: 'Starred' });
    await expect(starred).toHaveAttribute('aria-pressed', 'true');
    await page.mouse.move(0, 0);
    // Round md toggle becomes square (large, 16px) when selected.
    await expect
      .poll(() => starred.evaluate((el) => getComputedStyle(el).borderTopLeftRadius))
      .toBe('16px');
  });

  test('XS buttons keep a 48px touch target without changing layout', async ({ page }) => {
    await openStory(page, 'components-button--playground', {}, { size: 'xs' });
    const button = page.getByRole('button', { name: 'Button' });
    const box = (await button.boundingBox())!;
    expect(box.height).toBe(32);
    // A point 7px above the visual edge still lands on the button.
    const hit = await page.evaluate(
      ({ x, y }) => document.elementFromPoint(x, y)?.closest('button') !== null,
      { x: box.x + box.width / 2, y: box.y - 7 },
    );
    expect(hit).toBe(true);
  });
});

test.describe('Button spec fixes (2026-10-13)', () => {
  const shadow = (el: Element) => getComputedStyle(el).boxShadow;

  test('a pressed button takes the pressed elevation, not the hover one', async ({ page }) => {
    await openStory(page, 'components-button--variants');
    const labels = page.getByRole('button', { name: 'Label', exact: true });
    // Elevated, filled, tonal: rest shadow (elevated level 1) is the pressed shadow.
    for (const index of [0, 1, 2]) {
      const button = labels.nth(index);
      const rest = await button.evaluate(shadow);
      const box = (await button.boundingBox())!;
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await expect(button).toHaveAttribute('data-hovered', 'true');
      await expect.poll(() => button.evaluate(shadow)).not.toBe(rest);
      await page.mouse.down();
      await expect(button).toHaveAttribute('data-pressed', 'true');
      await expect.poll(() => button.evaluate(shadow)).toBe(rest);
      await page.mouse.up();
      await page.mouse.move(0, 0);
    }
  });

  test('an outlined button is the same size as a filled one, its outline inside the padding', async ({
    page,
  }) => {
    for (const [size, border, space] of [
      ['xs', 1, 16],
      ['sm', 1, 16],
      ['md', 1, 24],
      ['lg', 2, 48],
      ['xl', 3, 64],
    ] as const) {
      const measure = async (variant: string) => {
        await openStory(page, 'components-button--playground', {}, { size, variant });
        return page.getByRole('button', { name: 'Button' }).evaluate((el) => {
          const label = el.querySelector('span')!.getBoundingClientRect();
          const box = el.getBoundingClientRect();
          return {
            width: box.width,
            inset: label.left - box.left,
            border: parseFloat(getComputedStyle(el).borderLeftWidth),
          };
        });
      };
      const filled = await measure('filled');
      const outlined = await measure('outlined');
      expect(outlined.border).toBe(border);
      expect(outlined.width).toBe(filled.width);
      expect(outlined.inset).toBe(space);
      expect(filled.inset).toBe(space);
    }
  });

  test('a toggle swaps in its selected leading icon', async ({ page }) => {
    await openStory(page, 'components-button--toggle');
    const star = page.getByRole('button', { name: 'Star' });
    const path = () => star.locator('svg path').getAttribute('d');
    const unselected = await path();
    await star.click();
    await expect(page.getByRole('button', { name: 'Starred' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(
      await page.getByRole('button', { name: 'Starred' }).locator('svg path').getAttribute('d'),
    ).not.toBe(unselected);
  });
});

test.describe('Button reduced motion (2026-10-13)', () => {
  test('the press morph snaps to the pressed corners', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await openStory(page, 'components-button--playground', {}, { size: 'md' });
    const button = page.getByRole('button', { name: 'Button' });
    const box = (await button.boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    // Read on the first frame after the press itself, however late the test gets there.
    await button.evaluate((el) => {
      el.addEventListener(
        'pointerdown',
        () =>
          requestAnimationFrame(() => {
            (window as unknown as { firstRadius: string }).firstRadius =
              getComputedStyle(el).borderTopLeftRadius;
          }),
        { once: true },
      );
    });
    await page.mouse.down();
    await expect(button).toHaveAttribute('data-pressed', 'true');
    // The very next frame already has the pressed 12px corners.
    await expect
      .poll(() => page.evaluate(() => (window as unknown as { firstRadius?: string }).firstRadius))
      .toBe('12px');
    await page.mouse.up();
  });
});

test.describe('Button ripple', () => {
  interface RippleFrame {
    radius: number;
    opacity: number;
  }
  interface RippleSampling {
    frames: RippleFrame[];
    until: number;
    done: () => void;
  }

  /**
   * Starts sampling the ripple's radius and opacity every frame, before the press, so the
   * ripple can't run unseen however slow the machine is. The returned function keeps
   * sampling for `ms` more and until the ripple settles, then gives the frames.
   */
  const sample = async (page: Page) => {
    await page
      .getByRole('button')
      .first()
      .evaluate((el) => {
        const state: RippleSampling = { frames: [], until: Infinity, done: () => {} };
        (window as unknown as { rippleFrames: typeof state }).rippleFrames = state;
        const tick = () => {
          const s = getComputedStyle(el);
          state.frames.push({
            radius: parseFloat(s.getPropertyValue('--m3-ripple-radius')),
            opacity: parseFloat(s.getPropertyValue('--m3-ripple-opacity')),
          });
          // Past `until`, it stops once the ripple has settled: the same on three frames.
          const last = state.frames.slice(-3);
          const settled =
            last.length === 3 &&
            last.every(
              (frame) => frame.radius === last[0]!.radius && frame.opacity === last[0]!.opacity,
            );
          if (performance.now() < state.until || !settled) requestAnimationFrame(tick);
          else state.done();
        };
        tick();
      });
    return (ms: number) =>
      page.evaluate(
        (duration) =>
          new Promise<RippleFrame[]>((resolve) => {
            const state = (window as unknown as { rippleFrames: RippleSampling }).rippleFrames;
            // The last frame is sampled at least `ms` after this call, once settled.
            state.until = performance.now() + duration;
            state.done = () => resolve(state.frames);
          }),
        ms,
      );
  };

  test('a quick click still grows the ripple to the edges, then fades it', async ({ page }) => {
    await openStory(page, 'components-button--playground', {}, { size: 'md' });
    const button = page.getByRole('button').first();
    const box = (await button.boundingBox())!;
    const end = Math.ceil(Math.hypot(box.width, box.height) / 2 + 10);
    await page.mouse.move(box.x + 10, box.y + box.height / 2);
    const frames = await sample(page);
    await page.mouse.down();
    await page.mouse.up();
    const result = await frames(450);
    // Released at once, yet the radius reaches its end (half the diagonal + 10px)…
    expect(Math.max(...result.map((f) => f.radius))).toBeGreaterThanOrEqual(end - 1);
    // …while still visible, and only afterwards fades out.
    const full = result.find((f) => f.radius >= end - 1)!;
    expect(full.opacity).toBeGreaterThan(0.05);
    expect(result.at(-1)!.opacity).toBe(0);
  });
});

test.describe('Button ripple origin', () => {
  /** Where the ripple's centre is on the first frame after a quick press at `x`. */
  async function firstCentre(page: Page, x: number) {
    const button = page.getByRole('button').first();
    const box = (await button.boundingBox())!;
    await page.mouse.move(box.x + x, box.y + box.height / 2);
    // Read on the first frame after the press itself, however late the test gets there.
    await button.evaluate((el) => {
      const store = window as unknown as { firstCentre?: number };
      delete store.firstCentre;
      el.addEventListener(
        'pointerdown',
        () =>
          requestAnimationFrame(() => {
            store.firstCentre = parseFloat(getComputedStyle(el).getPropertyValue('--m3-ripple-x'));
          }),
        { once: true },
      );
    });
    await page.mouse.down();
    await page.mouse.up();
    const read = () =>
      page.evaluate(() => (window as unknown as { firstCentre?: number }).firstCentre);
    await expect.poll(read).not.toBeUndefined();
    return { centre: (await read())!, width: box.width };
  }

  test('each press starts at its own point, not the previous one', async ({ page }) => {
    await openStory(page, 'components-button--playground', {}, { size: 'lg' });
    const { width } = await firstCentre(page, 4);
    // Right edge first: starts there, not at the centre.
    const right = await firstCentre(page, width - 4);
    expect(right.centre).toBeGreaterThan(width * 0.8);
    await page.waitForTimeout(500);
    // Then the left edge: starts there, not where the last ripple was.
    const left = await firstCentre(page, 4);
    expect(left.centre).toBeLessThan(width * 0.2);
    // Pressing again during the previous ripple's fade-out still starts fresh.
    await page.waitForTimeout(260);
    const again = await firstCentre(page, width - 4);
    expect(again.centre).toBeGreaterThan(width * 0.8);
  });
});

test.describe('Button layout safety', () => {
  layoutSafetySuite('components-button--layout-override', { height: 40, radius: '20px' });
});

test.describe('Button layout safety · pending', () => {
  layoutSafetySuite('components-button--layout-override', {
    height: 40,
    radius: '20px',
    args: { pending: true },
    interactive: false,
    check: pendingCheck,
  });
});

test.describe('Button disabled outlines (2026-10-13)', () => {
  test('a disabled outline dims to 10%, and a selected toggle has none', async ({ page }) => {
    await openStory(page, 'components-button--disabled-outlined');
    const border = (name: string) =>
      page
        .getByRole('button', { name, exact: true })
        .evaluate((el) => getComputedStyle(el).borderTopColor);
    // outline-variant at 10% alpha, for a plain button and an unselected toggle.
    for (const name of ['Plain', 'Unselected']) {
      expect(await border(name)).toMatch(/(, 0\.1\)|\/ 0\.1\))$/);
    }
    expect(await border('Selected')).toBe('rgba(0, 0, 0, 0)');
  });

  // Re-audit 2026-10-15: a selected, disabled outlined toggle was outline-variant at 10%
  // while the outlined icon button was on-surface at 10% (the token).
  test('a selected, disabled outlined toggle is on-surface at 10%', async ({ page }) => {
    await openStory(page, 'components-button--disabled-outlined');
    const expected = await page.getByTestId('disabled-outlined').evaluate((el) => {
      const probe = document.createElement('div');
      probe.className = 'bg-on-surface/10';
      el.append(probe);
      const color = getComputedStyle(probe).backgroundColor;
      probe.remove();
      return color;
    });
    await expect(page.getByRole('button', { name: 'Selected', exact: true })).toHaveCSS(
      'background-color',
      expected,
    );
  });
});

// Re-audit 2026-10-15: under forced colours the containers vanished (background forced to
// Canvas, no border) and a selected toggle looked like an unselected one.
test.describe('Button forced colours', () => {
  test('every button keeps a boundary, its size, and a selected toggle stands out', async ({
    page,
  }) => {
    await openStory(page, 'components-button--variants');
    const buttons = page.getByTestId('variants').getByRole('button');
    const { before, after } = await underForcedColors(page, buttons);
    const grayText = await systemColor(page, 'GrayText');
    const highlight = await systemColor(page, 'Highlight');
    const names = await buttons.evaluateAll((elements) =>
      elements.map((element) => element.textContent!.trim()),
    );
    after.forEach((look, index) => {
      const label = `${names[index]} #${index}`;
      expect(look.borderStyle, label).toBe('solid');
      expect(look.borderWidth, label).toBeGreaterThanOrEqual(1);
      expect(look.width, label).toBe(before[index]!.width);
      expect(look.height, label).toBe(before[index]!.height);
      if (names[index] === 'Disabled') expect(look.color, label).toBe(grayText);
      if (names[index] === 'Selected') expect(look.background, label).toBe(highlight);
      if (names[index] === 'Toggle') expect(look.background, label).not.toBe(highlight);
    });
  });
});

// Button pending (docs/plans/button-pending.md, 2026-10-17).
test.describe('Button pending', () => {
  test('every variant and size keeps its size and place, and nothing around it moves', async ({
    page,
  }) => {
    await openStory(page, 'components-button--pending', {}, { pending: false });
    const before = await layoutBoxes(page.getByTestId('pending'));
    await openStory(page, 'components-button--pending', {}, { pending: true });
    await waitForIndicators(page.getByTestId('pending'));
    expect(await layoutBoxes(page.getByTestId('pending'))).toEqual(before);
  });

  for (const theme of THEMES) {
    test(`the indicator is at least 3:1 against every variant · ${theme}`, async ({ page }) => {
      for (const mode of MODES) {
        for (const contrast of ['standard', 'medium', 'high'] as const) {
          await openStory(page, 'components-button--pending', { theme, mode, contrast });
          const ratios = await indicatorContrasts(page.getByTestId('pending'));
          for (const [id, ratio] of Object.entries(ratios)) {
            // Disabled content is 38% on-surface by design (M3's disabled state).
            if (id === 'pending-disabled') continue;
            expect(ratio, `${id} · ${mode} · ${contrast}`).toBeGreaterThanOrEqual(3);
          }
        }
      }
    });
  }

  test('focus stays on the button on every frame of a keyboard press that makes it pending', async ({
    page,
  }) => {
    await openStory(page, 'components-button--pending-action', {}, { duration: '600' });
    const save = page.getByTestId('save');
    await page.keyboard.press('Tab');
    await expect(save).toBeFocused();
    await page.evaluate(() => {
      const store = window as unknown as { focusFrames: boolean[]; stopFrames?: boolean };
      store.focusFrames = [];
      const button = document.querySelector('[data-testid="save"]');
      const sample = () => {
        if (store.stopFrames) return;
        store.focusFrames.push(document.activeElement === button);
        requestAnimationFrame(sample);
      };
      requestAnimationFrame(sample);
    });
    await page.keyboard.press('Enter');
    await expect(save).toHaveAttribute('data-pending', 'true');
    // Chromium puts a space before the visually hidden suffix's comma ("Save , Loading").
    await expect(save).toHaveAccessibleName(/^Save ?, Loading$/);
    await expect(page.getByTestId('saves')).toHaveText('Saved 1');
    const frames = await page.evaluate(() => {
      const store = window as unknown as { focusFrames: boolean[]; stopFrames?: boolean };
      store.stopFrames = true;
      return store.focusFrames;
    });
    expect(frames.length).toBeGreaterThan(20);
    expect(frames.every(Boolean)).toBe(true);
    await expect(save).toHaveAccessibleName('Save');
  });

  test('a wait under 200ms changes nothing visible', async ({ page }) => {
    await openStory(page, 'components-button--pending-action', {}, { duration: '100' });
    const save = page.getByTestId('save');
    // Load the indicator first, so the short wait is the only thing that varies.
    await save.hover();
    await page.evaluate(() => {
      const store = window as unknown as { opacities: string[]; stopFrames?: boolean };
      store.opacities = [];
      const button = document.querySelector('[data-testid="save"]')!;
      const sample = () => {
        if (store.stopFrames) return;
        const slot = button.querySelector('[data-slot="pending-indicator"]')!;
        const faces = slot.previousElementSibling!;
        store.opacities.push(
          `${getComputedStyle(faces).opacity}/${getComputedStyle(slot).opacity}`,
        );
        requestAnimationFrame(sample);
      };
      requestAnimationFrame(sample);
    });
    await save.click();
    await expect(page.getByTestId('saves')).toHaveText('Saved 1');
    await page.waitForTimeout(300);
    const opacities = await page.evaluate(() => {
      const store = window as unknown as { opacities: string[]; stopFrames?: boolean };
      store.stopFrames = true;
      return store.opacities;
    });
    expect(new Set(opacities)).toEqual(new Set(['1/0']));
  });

  test('pressing a pending button does nothing', async ({ page }) => {
    await openStory(page, 'components-button--pending-action', {}, { duration: '800' });
    const save = page.getByTestId('save');
    await save.click();
    await expect(save).toHaveAttribute('data-pending', 'true');
    // `force`: Playwright counts `aria-disabled` as not enabled and would wait for it.
    await save.click({ force: true });
    await page.keyboard.press('Enter');
    await expect(page.getByTestId('saves')).toHaveText('Saved 1');
    await page.waitForTimeout(1000);
    await expect(page.getByTestId('saves')).toHaveText('Saved 1');
  });

  test.describe('reduced motion', () => {
    test.use({ reducedMotion: 'reduce' });

    test('only the content and the indicator fade', async ({ page }) => {
      await openStory(page, 'components-button--pending-action', {}, { duration: '1500' });
      const save = page.getByTestId('save');
      await save.hover();
      const result = await expectNoMovement(page, {
        parts: {
          button: save,
          faces: '[data-testid="save"] :has(+ [data-slot="pending-indicator"])',
          indicator: '[data-testid="save"] [data-slot="pending-indicator"]',
        },
        act: () => save.click(),
      });
      await expect(save).toHaveAttribute('data-pending', 'true');
      expect(result.frames.indicator!.at(-1)!.opacity).toBe(1);
    });
  });

  test.describe('screenshots', () => {
    const shoot = async (page: Page, name: string, globals = {}) => {
      await pauseClock(page);
      await openStory(page, 'components-button--pending', globals);
      const root = page.getByTestId('pending');
      await expect(root.locator('[data-slot="pending-indicator"] svg')).toHaveCount(
        await root.locator('[data-pending]').count(),
      );
      await expect(root).toHaveScreenshot(name);
    };
    for (const mode of MODES) {
      test(`pending · ${mode}`, async ({ page }) => shoot(page, `pending-${mode}.png`, { mode }));
    }
    test('pending · high contrast', async ({ page }) =>
      shoot(page, 'pending-high-contrast.png', { contrast: 'high' }));
    test('pending · rtl', async ({ page }) => shoot(page, 'pending-rtl.png', { dir: 'rtl' }));
    test('pending · forced colours', async ({ page }) => {
      await page.emulateMedia({ forcedColors: 'active' });
      await shoot(page, 'pending-forced-colors.png');
    });
  });
});
