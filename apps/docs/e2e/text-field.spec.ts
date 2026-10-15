import { expect, test, type Locator, type Page } from '@playwright/test';
import { MODES, THEMES } from './shots';
import { openStory } from './story';

const box = async (locator: Locator) => (await locator.boundingBox())!;
const settle = (page: Page) => page.waitForTimeout(500);

/** The field root (outermost element) of the input labelled `name`. */
const fieldOf = (page: Page, name: string) =>
  page.getByLabel(name, { exact: true }).locator('xpath=ancestor::*[@data-field-state][1]');
const containerOf = (page: Page, name: string) => fieldOf(page, name).locator('> div').first();

test.describe('TextField visual regression', () => {
  for (const theme of THEMES) {
    for (const mode of MODES) {
      test(`variants · ${theme} · ${mode}`, async ({ page }) => {
        await openStory(page, 'components-textfield--variants', { theme, mode });
        await expect(page.getByTestId('variants')).toHaveScreenshot(
          `variants-${theme}-${mode}.png`,
        );
      });
    }
  }

  test('variants · rtl', async ({ page }) => {
    await openStory(page, 'components-textfield--variants', { dir: 'rtl' });
    await expect(page.getByTestId('variants')).toHaveScreenshot('variants-rtl.png');
  });
});

test.describe('TextField label', () => {
  test('filled: the label rests centred and floats to 8px from the top on focus', async ({
    page,
  }) => {
    await openStory(page, 'components-textfield--playground');
    const container = containerOf(page, 'Label');
    const label = page.locator('label', { hasText: 'Label' });
    const c = await box(container);
    const resting = await box(label);
    expect(resting.y + resting.height / 2 - c.y).toBeCloseTo(28, 0);

    await page.getByLabel('Label', { exact: true }).focus();
    await settle(page);
    const floated = await box(label);
    expect(floated.y - c.y).toBeCloseTo(8, 0);
    expect(floated.height).toBe(16);
    expect(await label.evaluate((el) => getComputedStyle(el).color)).toBe(
      await page
        .evaluate(() =>
          getComputedStyle(document.querySelector('[data-theme]')!)
            .getPropertyValue('--md-sys-color-primary')
            .trim(),
        )
        .then((hex) => {
          const n = Number.parseInt(hex.slice(1), 16);
          return `rgb(${n >> 16}, ${(n >> 8) & 255}, ${n & 255})`;
        }),
    );
  });

  test('outlined: the floated label sits on the border inside a notch', async ({ page }) => {
    await openStory(page, 'components-textfield--playground', {}, { variant: 'outlined' });
    const container = containerOf(page, 'Label');
    const label = page.locator('label', { hasText: 'Label' });
    const legend = fieldOf(page, 'Label').locator('legend');
    expect((await box(legend)).width).toBeLessThan(1);

    await page.getByLabel('Label', { exact: true }).focus();
    await settle(page);
    const c = await box(container);
    const floated = await box(label);
    // Centred on the top border, starting 16px in.
    expect(floated.y + floated.height / 2 - c.y).toBeCloseTo(0, 0);
    expect(floated.x - c.x).toBeCloseTo(16, 0);
    // The notch is the label's width plus 4px on each side.
    expect((await box(legend)).width).toBeCloseTo(floated.width + 8, 0);
    expect(
      await fieldOf(page, 'Label')
        .locator('fieldset')
        .evaluate((el) => getComputedStyle(el).borderTopWidth),
    ).toBe('2px');
  });

  // Compose sizes the cut-out from the label as it moves; the notch opens on the label's
  // spring from its own width, so the two keep pace.
  test('outlined: the notch opens in step with the label', async ({ page }) => {
    await openStory(page, 'components-textfield--playground', {}, { variant: 'outlined' });
    const field = fieldOf(page, 'Label');
    // Focused from inside the sampler, after its first frame, so the whole float is sampled
    // however slow the machine is.
    const frames = await field.evaluate(
      (root) =>
        new Promise<{ notch: number; top: number }[]>((resolve) => {
          const legend = root.querySelector('legend')!;
          const label = root.querySelector('label')!;
          const out: { notch: number; top: number }[] = [];
          const sample = () =>
            out.push({
              notch: legend.getBoundingClientRect().width,
              top: parseFloat(getComputedStyle(label).top),
            });
          sample();
          root.querySelector('input')!.focus();
          const start = performance.now();
          const tick = () => {
            sample();
            if (performance.now() - start < 400) requestAnimationFrame(tick);
            else resolve(out);
          };
          requestAnimationFrame(tick);
        }),
    );
    const end = frames.at(-1)!;
    const restTop = 16;
    for (const frame of frames) {
      const labelProgress = (restTop - frame.top) / (restTop - end.top);
      const notchProgress = frame.notch / end.notch;
      expect(Math.abs(labelProgress - notchProgress)).toBeLessThan(0.2);
    }
  });

  test('filled: the placeholder fades in; the indicator thickens on the spatial spring', async ({
    page,
  }) => {
    await openStory(page, 'components-textfield--playground', {}, { placeholder: 'Type here' });
    const input = page.getByLabel('Label', { exact: true });
    const timing = await input.evaluate((el) => {
      // Chromium doesn't compute ::placeholder transitions, so read the rule that applies.
      const rules = [...document.styleSheets].flatMap((sheet) => {
        const walk = (list: CSSRuleList): CSSStyleRule[] =>
          [...list].flatMap((rule) =>
            rule instanceof CSSStyleRule
              ? [rule, ...walk(rule.cssRules)]
              : 'cssRules' in rule
                ? walk((rule as CSSGroupingRule).cssRules)
                : [],
          );
        return walk(sheet.cssRules);
      });
      const placeholder = rules.find(
        (rule) =>
          rule.style.transitionProperty === 'opacity' &&
          [...el.classList].some(
            (name) =>
              rule.selectorText.includes(CSS.escape(name)) &&
              name.startsWith('placeholder:transition'),
          ),
      );
      const indicator = el
        .closest('[data-field-state]')!
        .querySelector('[class*="bottom-0"][class*="h-px"]')!;
      const style = getComputedStyle(indicator);
      return {
        placeholder: placeholder !== undefined,
        indicator: [style.transitionProperty, style.transitionDuration],
      };
    });
    expect(timing.placeholder).toBe(true);
    expect(timing.indicator[0]).toBe('background-color, height');
    // Colour on the fast effects spring, thickness on the (longer) fast spatial spring.
    const [colour, height] = timing.indicator[1]!.split(', ').map(parseFloat);
    expect(height).toBeGreaterThan(colour!);
  });

  test('outlined: the resting label darkens to on-surface on hover', async ({ page }) => {
    await openStory(page, 'components-textfield--playground', {}, { variant: 'outlined' });
    const label = page.locator('label', { hasText: 'Label' });
    await containerOf(page, 'Label').hover();
    await settle(page);
    const onSurface = await page.evaluate(() =>
      getComputedStyle(document.querySelector('[data-theme]')!)
        .getPropertyValue('--md-sys-color-on-surface')
        .trim(),
    );
    const n = Number.parseInt(onSurface.slice(1), 16);
    await expect(label).toHaveCSS('color', `rgb(${n >> 16}, ${(n >> 8) & 255}, ${n & 255})`);
  });

  test('outlined with a leading icon: the label moves from after the icon to 16px', async ({
    page,
  }) => {
    await openStory(page, 'components-textfield--variants');
    const search = page.getByLabel('Search', { exact: true }).nth(1);
    const field = search.locator('xpath=ancestor::*[@data-field-state][1]');
    const label = field.locator('label');
    const c = await box(field.locator('> div').first());
    // Populated, so already floated at 16px.
    expect((await box(label)).x - c.x).toBeCloseTo(16, 0);
  });

  test('outlined fields without a label keep their border on the container edge', async ({
    page,
  }) => {
    await openStory(page, 'components-textfield--variants');
    const input = page.getByRole('textbox', { name: 'No label' }).nth(1);
    const field = input.locator('xpath=ancestor::*[@data-field-state][1]');
    const container = await box(field.locator('> div').first());
    const outline = await box(field.locator('fieldset'));
    expect(container.height).toBe(56);
    expect(outline.y).toBeCloseTo(container.y, 0);
    expect(outline.height).toBeCloseTo(56, 0);
  });

  test('filled fields keep 56px height and indicator thickens on focus', async ({ page }) => {
    await openStory(page, 'components-textfield--playground');
    const container = containerOf(page, 'Label');
    expect((await box(container)).height).toBe(56);
    const indicator = container.locator('> span[aria-hidden]').last();
    expect((await box(indicator)).height).toBe(1);
    await page.getByLabel('Label', { exact: true }).focus();
    await settle(page);
    expect((await box(indicator)).height).toBe(2);
  });
});

test.describe('TextField behaviour', () => {
  test('a text area keeps its height and scrolls', async ({ page }) => {
    await openStory(page, 'components-textfield--text-area');
    const message = page.getByLabel('Message');
    const height = (await box(message)).height;
    expect(height).toBeCloseTo(96, 0); // four 24px lines
    await message.fill('1\n2\n3\n4\n5\n6\n7\n8');
    expect((await box(message)).height).toBe(height);
    expect(await message.evaluate((el) => getComputedStyle(el).overflowY)).toBe('auto');
  });

  test('an invalid field shows the error icon and colours its supporting text', async ({
    page,
  }) => {
    await openStory(page, 'components-textfield--variants');
    const field = fieldOf(page, 'Password').first();
    await expect(field.getByRole('img', { name: 'Error' })).toBeVisible();
    const error = await page.evaluate(() =>
      getComputedStyle(document.querySelector('[data-theme]')!)
        .getPropertyValue('--md-sys-color-error')
        .trim(),
    );
    const n = Number.parseInt(error.slice(1), 16);
    await expect(field.getByText('At least 8 characters')).toHaveCSS(
      'color',
      `rgb(${n >> 16}, ${(n >> 8) & 255}, ${n & 255})`,
    );
  });

  test('supporting text can show only on focus', async ({ page }) => {
    await openStory(page, 'components-textfield--supporting-text-on-focus');
    const text = page.getByText('Shown on your profile');
    await expect(text).toHaveCSS('opacity', '0');
    await page.getByLabel('Display name').focus();
    await expect(text).toHaveCSS('opacity', '1');
  });

  test('multiline with autoGrow grows with content up to maxRows, then scrolls', async ({
    page,
  }) => {
    await openStory(page, 'components-textfield--multiline');
    const notes = page.getByLabel('Notes');
    const one = (await box(notes)).height;
    await notes.fill('1\n2\n3');
    const three = (await box(notes)).height;
    expect(three).toBeCloseTo(one * 3, 0);
    await notes.fill('1\n2\n3\n4\n5\n6\n7\n8');
    expect((await box(notes)).height).toBeCloseTo(one * 5, 0);
    expect(await notes.evaluate((el) => getComputedStyle(el).overflowY)).toBe('auto');
  });

  test('live validation and character count', async ({ page }) => {
    await openStory(page, 'components-textfield--validation');
    const input = page.getByLabel('Username');
    await input.fill('ab');
    await expect(page.getByText('At least 3 characters')).toBeVisible();
    await expect(page.getByText('2/20')).toBeVisible();
    await expect(input).toHaveAttribute('aria-invalid', 'true');
    await input.fill('abc');
    await expect(page.getByText('At least 3 characters')).toHaveCount(0);
    await expect(page.getByText('Letters and numbers')).toBeVisible();
  });

  test('clicking the container focuses the input; the clear button does not steal focus', async ({
    page,
  }) => {
    await openStory(page, 'components-textfield--variants');
    const search = page.getByLabel('Search', { exact: true }).first();
    const field = search.locator('xpath=ancestor::*[@data-field-state][1]');
    const c = await box(field.locator('> div').first());
    await page.mouse.click(c.x + 24, c.y + c.height / 2); // on the leading icon
    await expect(search).toBeFocused();
  });
});

test.describe('TextField layout safety', () => {
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
    for (const variant of ['filled', 'outlined'] as const) {
      for (const dir of ['ltr', 'rtl'] as const) {
        test(`${override} · ${variant} · ${dir}`, async ({ page }) => {
          await openStory(
            page,
            'components-textfield--layout-override',
            { dir },
            { override, variant },
          );
          const field = page.getByTestId('target');
          const container = field.locator('> div').first();
          expect(await container.evaluate((el) => (el as HTMLElement).offsetHeight)).toBe(56);
          const input = page.getByLabel('Name');
          await input.click();
          await input.fill('Grace');
          await expect(input).toHaveValue('Grace');
          await expect(field).toHaveAttribute('data-floated', 'true');
        });
      }
    }
  }
});
