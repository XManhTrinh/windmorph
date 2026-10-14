import { expect, test, type Locator, type Page } from '@playwright/test';
import { MODES, THEMES } from './shots';
import { openStory } from './story';

const width = (locator: Locator) =>
  locator.evaluate((el) => (el as HTMLElement).getBoundingClientRect().width);

const radii = (locator: Locator) =>
  locator.evaluate((el) => {
    const s = getComputedStyle(el);
    return {
      topLeft: s.borderTopLeftRadius,
      topRight: s.borderTopRightRadius,
      bottomLeft: s.borderBottomLeftRadius,
      bottomRight: s.borderBottomRightRadius,
    };
  });

async function settle(page: Page) {
  // Longest spring in play is the fast spatial one (< 400ms).
  await page.waitForTimeout(500);
}

test.describe('ButtonGroup visual regression', () => {
  for (const theme of THEMES) {
    for (const mode of MODES) {
      test(`variants · ${theme} · ${mode}`, async ({ page }) => {
        await openStory(page, 'composites-buttongroup--variants', { theme, mode });
        await expect(page.getByTestId('variants')).toHaveScreenshot(
          `variants-${theme}-${mode}.png`,
        );
      });
    }
  }

  test('sizes', async ({ page }) => {
    await openStory(page, 'composites-buttongroup--sizes');
    await expect(page.getByTestId('sizes')).toHaveScreenshot('sizes.png');
  });

  test('sizes · rtl', async ({ page }) => {
    await openStory(page, 'composites-buttongroup--sizes', { dir: 'rtl' });
    await expect(page.getByTestId('sizes')).toHaveScreenshot('sizes-rtl.png');
  });
});

test.describe('ButtonGroup press expansion', () => {
  for (const [label, name] of [
    ['middle', 'Share'],
    ['end', 'Create'],
  ] as const) {
    test(`a pressed ${label} button grows, its neighbours shrink and the group keeps its width`, async ({
      page,
    }) => {
      await openStory(page, 'composites-buttongroup--standard');
      const group = page.getByRole('toolbar', { name: 'Actions' });
      const pressed = group.getByRole('button', { name });
      const groupWidth = await width(group);
      const restWidth = await width(pressed);

      const box = (await pressed.boundingBox())!;
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.mouse.down();
      await settle(page);
      const grown = await width(pressed);
      expect(grown).toBeGreaterThan(restWidth + 4);
      expect(grown).toBeLessThanOrEqual(restWidth * 1.15 + 1);
      expect(Math.abs((await width(group)) - groupWidth)).toBeLessThanOrEqual(1);

      await page.mouse.up();
      await settle(page);
      expect(Math.abs((await width(pressed)) - restWidth)).toBeLessThanOrEqual(0.5);
      expect(await pressed.evaluate((el) => (el as HTMLElement).style.flex)).toBe('');
    });
  }
});

test.describe('ButtonGroup standard', () => {
  test('spaces its buttons by size: 18, 12, then 8px', async ({ page }) => {
    await openStory(page, 'composites-buttongroup--sizes');
    const gaps = await Promise.all(
      ['xs', 'sm', 'md', 'lg', 'xl'].map((size) =>
        page
          .getByRole('toolbar', { name: `Standard ${size}` })
          .evaluate((el) => getComputedStyle(el).columnGap),
      ),
    );
    expect(gaps).toEqual(['18px', '12px', '8px', '8px', '8px']);
  });

  test('arrow keys move between buttons without a selection mode', async ({ page }) => {
    await openStory(page, 'composites-buttongroup--standard');
    await page.keyboard.press('Tab');
    await expect(page.getByRole('button', { name: 'Create' })).toBeFocused();
    await page.keyboard.press('ArrowRight');
    await expect(page.getByRole('button', { name: 'Share' })).toBeFocused();
    await page.keyboard.press('ArrowLeft');
    await expect(page.getByRole('button', { name: 'Create' })).toBeFocused();
  });
});

test.describe('ButtonGroup connected', () => {
  test('a pressed button changes shape only: no button changes width', async ({ page }) => {
    await openStory(page, 'composites-buttongroup--connected-single-selection');
    const radios = page.getByRole('radio');
    const before = await Promise.all((await radios.all()).map(width));
    const day = page.getByRole('radio', { name: 'Day' });
    const box = (await day.boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await settle(page);
    expect((await radii(day)).topRight).toBe('4px');
    expect(await Promise.all((await radios.all()).map(width))).toEqual(before);
    await page.mouse.up();
  });

  test('spans its container, and XS / S icon buttons stay 48px wide', async ({ page }) => {
    await openStory(page, 'composites-buttongroup--connected-single-selection');
    expect(await width(page.getByRole('radiogroup'))).toBe(480);
    await openStory(page, 'composites-buttongroup--connected-multiple-selection');
    for (const button of await page.getByTestId('format').getByRole('button').all()) {
      expect(await width(button)).toBeGreaterThanOrEqual(48);
    }
  });

  test('inner corners grow with size, and square groups square the outer corners', async ({
    page,
  }) => {
    await openStory(page, 'composites-buttongroup--sizes');
    const inner = { xs: '4px', sm: '8px', md: '8px', lg: '16px', xl: '20px' };
    for (const [size, corner] of Object.entries(inner)) {
      const round = page.getByRole('toolbar', { name: `Connected round ${size}` });
      const square = page.getByRole('toolbar', { name: `Connected square ${size}` });
      const roundFirst = await radii(round.getByRole('button').first());
      expect(roundFirst.topRight).toBe(corner);
      expect(roundFirst.topLeft).not.toBe(corner);
      expect(await radii(square.getByRole('button').first())).toEqual({
        topLeft: corner,
        topRight: corner,
        bottomLeft: corner,
        bottomRight: corner,
      });
    }
  });

  test('inner corners are small, outer corners full, and selected buttons become full', async ({
    page,
  }) => {
    await openStory(page, 'composites-buttongroup--connected-single-selection');
    const day = page.getByRole('radio', { name: 'Day' });
    const week = page.getByRole('radio', { name: 'Week' });
    const year = page.getByRole('radio', { name: 'Year' });

    expect(await radii(day)).toEqual({
      topLeft: '20px',
      bottomLeft: '20px',
      topRight: '8px',
      bottomRight: '8px',
    });
    expect(await radii(year)).toMatchObject({ topLeft: '8px', topRight: '20px' });
    // "Week" is selected: all corners full.
    expect(await radii(week)).toEqual({
      topLeft: '20px',
      topRight: '20px',
      bottomLeft: '20px',
      bottomRight: '20px',
    });

    await day.click();
    await page.mouse.move(0, 0);
    await settle(page);
    await expect(day).toHaveAttribute('aria-checked', 'true');
    await expect(page.getByTestId('selection')).toHaveText('day');
    expect((await radii(day)).topRight).toBe('20px');
    expect((await radii(week)).topRight).toBe('8px');
  });

  test('outer corners follow the reading direction in RTL', async ({ page }) => {
    await openStory(page, 'composites-buttongroup--connected-single-selection', { dir: 'rtl' });
    const day = page.getByRole('radio', { name: 'Day' });
    expect(await radii(day)).toMatchObject({ topRight: '20px', topLeft: '8px' });
  });

  test('arrow keys move between options and the selection is announced', async ({ page }) => {
    await openStory(page, 'composites-buttongroup--connected-single-selection');
    // React Aria keeps every option tabbable and adds arrow-key movement.
    await page.keyboard.press('Tab');
    await expect(page.getByRole('radio', { name: 'Day' })).toBeFocused();
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowRight');
    await expect(page.getByRole('radio', { name: 'Month' })).toBeFocused();
    await page.keyboard.press('Space');
    await expect(page.getByTestId('selection')).toHaveText('month');
    await expect(page.getByRole('radiogroup', { name: 'Calendar view' })).toBeVisible();
  });

  test('multiple selection with icon buttons', async ({ page }) => {
    await openStory(page, 'composites-buttongroup--connected-multiple-selection');
    const italic = page.getByRole('button', { name: 'Italic' });
    await italic.click();
    await expect(italic).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByRole('button', { name: 'Bold' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await page.mouse.move(0, 0);
    await settle(page);
    await expect(page.getByTestId('format')).toHaveScreenshot('connected-multiple.png');
  });
});

test.describe('ButtonGroup layout safety', () => {
  const overrides = [
    'none',
    'fixed',
    'absolute',
    'sticky',
    'static',
    'overflowHidden',
    'fullWidth',
    'transform',
  ];
  for (const override of overrides) {
    for (const connected of [false, true]) {
      for (const dir of ['ltr', 'rtl'] as const) {
        test(`${override} · ${connected ? 'connected' : 'standard'} · ${dir}`, async ({ page }) => {
          await openStory(
            page,
            'composites-buttongroup--layout-override',
            { dir },
            { override, connected, transformedAncestor: override === 'transform' },
          );
          const group = page.getByTestId('target');
          const buttons = group.getByRole('button');
          await expect(buttons).toHaveCount(3);
          for (const button of await buttons.all()) {
            expect(await button.evaluate((el) => (el as HTMLElement).offsetHeight)).toBe(40);
          }
          const gap = await group.evaluate((el) => getComputedStyle(el).columnGap);
          expect(gap).toBe(connected ? '2px' : '12px');
          await buttons.first().click();
          await expect(page.getByTestId('count')).toHaveText('Pressed 1');
        });
      }
    }
  }
});

test.describe('ButtonGroup spec fixes (2026-10-13)', () => {
  test('connected buttons share the width equally', async ({ page }) => {
    await openStory(page, 'composites-buttongroup--connected-single-selection');
    const widths = await Promise.all((await page.getByRole('radio').all()).map(width));
    // 480px, 3 × 2px gaps, four buttons.
    for (const w of widths) expect(Math.abs(w - (480 - 6) / 4)).toBeLessThan(0.5);
  });

  test('an XS connected press tightens the inner corners to 2px', async ({ page }) => {
    await openStory(page, 'composites-buttongroup--connected-multiple-selection');
    const italic = page.getByRole('button', { name: 'Italic' });
    expect((await radii(italic)).topLeft).toBe('4px');
    const box = (await italic.boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await settle(page);
    expect(await radii(italic)).toEqual({
      topLeft: '2px',
      topRight: '2px',
      bottomLeft: '2px',
      bottomRight: '2px',
    });
    await page.mouse.up();
  });

  test('under reduced motion a press changes no widths', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await openStory(page, 'composites-buttongroup--standard');
    const buttons = await page.getByRole('toolbar').getByRole('button').all();
    const before = await Promise.all(buttons.map(width));
    const box = (await buttons[1]!.boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await expect(buttons[1]!).toHaveAttribute('data-pressed', 'true');
    await settle(page);
    expect(await Promise.all(buttons.map(width))).toEqual(before);
    await page.mouse.up();
  });

  test('a group variant reaches its icon buttons', async ({ page }) => {
    await openStory(page, 'composites-buttongroup--sizes');
    const group = page.getByRole('toolbar', { name: 'Standard sm' });
    const [copy, search] = await Promise.all([
      group
        .getByRole('button', { name: 'One' })
        .evaluate((el) => getComputedStyle(el).backgroundColor),
      group
        .getByRole('button', { name: 'Search' })
        .evaluate((el) => getComputedStyle(el).backgroundColor),
    ]);
    expect(search).toBe(copy);
  });
});

test.describe('ButtonGroup overflow', () => {
  const shown = (group: Locator) =>
    group.evaluate((el) =>
      [...el.children]
        .filter((child) => getComputedStyle(child).display !== 'none')
        .map((child) => child.getAttribute('aria-label') ?? child.textContent),
    );

  test('folds the trailing buttons that do not fit, and brings them back with room', async ({
    page,
  }) => {
    await openStory(page, 'composites-buttongroup--overflow', {}, { width: '320' });
    const group = page.getByTestId('standard');
    expect(await shown(group)).toEqual(['Reply', 'Forward', 'More options']);
    // The indicator sits within the group, the gap after the last button.
    const more = group.getByRole('button', { name: 'More options' });
    const groupBox = (await group.boundingBox())!;
    const moreBox = (await more.boundingBox())!;
    expect(moreBox.x + moreBox.width).toBeLessThanOrEqual(groupBox.x + groupBox.width + 0.5);

    await openStory(page, 'composites-buttongroup--overflow', {}, { width: '720' });
    expect(await shown(page.getByTestId('standard'))).toEqual([
      'Reply',
      'Forward',
      'Star',
      'Archive',
      'Delete',
    ]);

    // Resizing re-measures.
    await openStory(page, 'composites-buttongroup--overflow', {}, { width: '720' });
    await page.getByTestId('overflow').evaluate((el) => (el.style.width = '200px'));
    await expect.poll(() => shown(page.getByTestId('standard'))).toEqual(['Reply', 'More options']);
  });

  test('the menu holds the folded buttons: only toggles are checkable, actions stay plain', async ({
    page,
  }) => {
    await openStory(page, 'composites-buttongroup--overflow', {}, { width: '320' });
    const group = page.getByTestId('standard');
    await group.getByRole('button', { name: 'More options' }).click();
    const menu = page.getByRole('menu');
    await expect(menu).toBeVisible();
    await expect(menu.getByRole('menuitemcheckbox')).toHaveText(['Star']);
    await expect(menu.getByRole('menuitem')).toHaveText(['Archive', 'Delete']);
    for (const name of ['Archive', 'Delete']) {
      await expect(menu.getByRole('menuitem', { name })).not.toHaveAttribute('aria-checked');
    }
    await expect(menu.getByRole('menuitem', { name: 'Delete' })).toHaveAttribute(
      'aria-disabled',
      'true',
    );
    const star = menu.getByRole('menuitemcheckbox', { name: 'Star' });
    await expect(star).toHaveAttribute('aria-checked', 'false');
    await star.click();
    // A toggle keeps the menu open and shows its new state.
    await expect(star).toHaveAttribute('aria-checked', 'true');
    // An action runs its button and closes the menu, with no checked state.
    await menu.getByRole('menuitem', { name: 'Archive' }).click();
    await expect(page.getByTestId('last')).toContainText('Last: archive');
    await expect(menu).toBeHidden();
  });

  test('keyboard: arrows reach the indicator, Enter opens the menu, a choice selects', async ({
    page,
  }) => {
    await openStory(page, 'composites-buttongroup--overflow', {}, { width: '200' });
    const connected = page.getByTestId('connected');
    expect((await shown(connected)).length).toBeLessThan(5);
    const more = connected.getByRole('button', { name: 'More options' });
    // The indicator takes the trailing corners.
    const r = await radii(more);
    expect(r.topRight).toBe('20px');
    await more.focus();
    await page.keyboard.press('Enter');
    const menu = page.getByRole('menu');
    await expect(menu).toBeVisible();
    await menu.getByRole('menuitemradio', { name: 'Year' }).focus();
    await page.keyboard.press('Enter');
    await expect(page.getByTestId('last')).toContainText('View: year');
  });

  test('mirrors in RTL: the indicator is at the trailing (left) end', async ({ page }) => {
    await openStory(page, 'composites-buttongroup--overflow', { dir: 'rtl' }, { width: '320' });
    const group = page.getByTestId('standard');
    const more = (await group.getByRole('button', { name: 'More options' }).boundingBox())!;
    const reply = (await group.getByRole('button', { name: 'Reply' }).boundingBox())!;
    expect(more.x).toBeLessThan(reply.x);
  });
});

test.describe('ButtonGroup press expansion, frame by frame (2026-10-14)', () => {
  interface Frame {
    /** The frame's `performance.now()`. */
    time: number;
    /** Each item's layout width (`offsetWidth`, no transforms). */
    widths: number[];
    /** Whether the group still sizes any item inline. */
    pinned: boolean;
  }
  interface Recording {
    frames: Frame[];
    running: boolean;
  }
  /** Samples the group's items on every animation frame until `stop()`. */
  async function recordFrames(page: Page, group: Locator) {
    await group.evaluate((el) => {
      const items = [...el.children] as HTMLElement[];
      const state: Recording = { frames: [], running: true };
      const sample = () => {
        state.frames.push({
          time: performance.now(),
          widths: items.map((item) => item.offsetWidth),
          pinned: items.some((item) => item.style.flex !== ''),
        });
        if (state.running) requestAnimationFrame(sample);
      };
      sample();
      (window as unknown as { widthRecording: Recording }).widthRecording = state;
    });
    return {
      stop: () =>
        page.evaluate(() => {
          const state = (window as unknown as { widthRecording: Recording }).widthRecording;
          state.running = false;
          return state.frames;
        }),
    };
  }

  const connected = { variant: 'connected', expandedRatio: '0.15' };
  for (const [label, args, press, layout] of [
    ['standard', {}, 'Share', {}],
    ['connected, equal widths', connected, 'Share', {}],
    // The group's width comes from its items', so pinning only the moving ones would change it.
    ['connected, sized by its content', connected, 'Create', { fit: true }],
    // Layout widths, not the scaled boxes.
    ['connected, in a scaled container', connected, 'Share', { fit: true, scale: '0.8' }],
  ] as const) {
    test(`${label}: widths only move between rest and the bump`, async ({ page }) => {
      await openStory(page, 'composites-buttongroup--standard', {}, args);
      await page.locator('#storybook-root').evaluate((root, { fit, scale }) => {
        if (scale) root.style.scale = scale;
        if (fit)
          (root.querySelector('[role="toolbar"]') as HTMLElement).style.width = 'fit-content';
      }, layout);
      const group = page.getByRole('toolbar', { name: 'Actions' });
      const items = await group.evaluate((el) =>
        ([...el.children] as HTMLElement[]).map((item) => ({
          name: item.getAttribute('aria-label') ?? item.textContent,
          rest: item.offsetWidth,
          // The hook's compression limit: half the space around the content, unscaled.
          limit:
            (item.offsetWidth -
              (item.firstElementChild!.getBoundingClientRect().width * item.offsetWidth) /
                item.getBoundingClientRect().width) /
            2,
        })),
      );
      const rest = items.map((item) => item.rest);
      if (label === 'connected, equal widths') {
        // The story's three labelled buttons share the width equally.
        for (const item of items.slice(0, 3)) {
          expect(Math.abs(item.rest - rest[0]!)).toBeLessThanOrEqual(1);
        }
      }
      const index = items.findIndex((item) => item.name === press);
      const bump = 0.15 * rest[index]!;
      // The fast spatial spring overshoots its target a little in the expressive scheme.
      const overshoot = bump / 4 + 1;

      // The release's spring, in ms (a minified stylesheet writes it in seconds).
      const spring = await group.evaluate((el) => {
        const value = getComputedStyle(el.firstElementChild!)
          .getPropertyValue('--md-sys-motion-spring-spatial-fast-duration')
          .trim();
        return Number.parseFloat(value) * (value.endsWith('ms') ? 1 : 1000);
      });
      expect(spring).toBeGreaterThan(100);

      const recorder = await recordFrames(page, group);
      const box = (await group.getByRole('button', { name: press }).boundingBox())!;
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.mouse.down();
      await page.waitForTimeout(600);
      const releasedAt = await page.evaluate(() => performance.now());
      await page.mouse.up();
      await page.waitForTimeout(1200);
      const frames = await recorder.stop();

      // The press bumped the item.
      expect(Math.max(...frames.map((frame) => frame.widths[index]!))).toBeGreaterThan(
        rest[index]! + bump / 2,
      );
      for (const [n, { widths }] of frames.entries()) {
        for (const [i, item] of items.entries()) {
          const where = `frame ${n}, ${item.name}: ${widths.join(' / ')}`;
          const floor = Math.abs(i - index) === 1 ? item.rest - item.limit : item.rest;
          const ceiling = i === index ? item.rest + bump : item.rest;
          expect(widths[i]!, where).toBeGreaterThanOrEqual(Math.floor(floor - overshoot));
          expect(widths[i]!, where).toBeLessThanOrEqual(Math.ceil(ceiling + overshoot));
        }
      }

      // The group lets go of its inline sizing only once the release has settled at rest, so
      // nothing jumps then, and the items stay exactly at rest afterwards.
      const lastPinned = frames.findLastIndex((frame) => frame.pinned);
      expect(lastPinned).toBeGreaterThan(0);
      expect(lastPinned).toBeLessThan(frames.length - 5);
      const [before, after] = [frames[lastPinned]!, frames[lastPinned + 1]!];
      expect(after.time - releasedAt).toBeGreaterThanOrEqual(spring);
      // The frame painted just before (a starved runner may paint none for a while).
      if (after.time - before.time < 50) {
        for (const [i, width] of before.widths.entries()) {
          expect(Math.abs(width - rest[i]!), `last pinned frame, item ${i}`).toBeLessThanOrEqual(1);
        }
      }
      for (const { widths } of frames.slice(lastPinned + 1)) expect(widths).toEqual(rest);
    });
  }
});
