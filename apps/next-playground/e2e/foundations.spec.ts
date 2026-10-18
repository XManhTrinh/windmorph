import { expect, test, type Page } from '@playwright/test';

const COOKIE = 'windmorph-theme';
const encode = (state: Record<string, string>) =>
  encodeURIComponent(new URLSearchParams(state).toString());

/** Fails the test on React hydration errors or any console error. */
function collectConsoleErrors(page: Page) {
  const errors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('pageerror', (error) => errors.push(error.message));
  return errors;
}

const rootVar = (page: Page, name: string) =>
  page.evaluate((n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim(), name);

test.describe('App Router', () => {
  test('server-renders the stored theme so there is no flash', async ({
    page,
    context,
    baseURL,
  }) => {
    const errors = collectConsoleErrors(page);
    await context.addCookies([
      {
        name: COOKIE,
        value: encode({ theme: 'ocean', mode: 'dark', contrast: 'high', motion: 'standard' }),
        url: baseURL!,
      },
    ]);
    const response = await page.goto('/');
    const html = await response!.text();
    expect(html).toMatch(
      /<html[^>]*data-theme="ocean"[^>]*data-mode="dark"[^>]*data-contrast="high"[^>]*data-motion="standard"/,
    );
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'ocean');
    expect(await rootVar(page, 'color-scheme')).toBe('dark');
    expect(errors).toEqual([]);
  });

  test('switching theme updates <html> and survives a reload', async ({ page }) => {
    const errors = collectConsoleErrors(page);
    await page.goto('/');
    const lightPrimary = await rootVar(page, '--md-sys-color-primary');

    await page.getByLabel('Colour theme').selectOption('forest');
    await page.getByLabel('Mode').selectOption('light');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'forest');
    expect(await rootVar(page, '--md-sys-color-primary')).not.toBe(lightPrimary);

    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'forest');
    await expect(page.getByLabel('Colour theme')).toHaveValue('forest');
    expect(errors).toEqual([]);
  });

  test('system mode follows prefers-color-scheme', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/');
    const lightSurface = await rootVar(page, '--md-sys-color-surface');
    await expect(page.getByTestId('resolved-mode')).toContainText('light');

    await page.emulateMedia({ colorScheme: 'dark' });
    await expect(page.getByTestId('resolved-mode')).toContainText('dark');
    expect(await rootVar(page, '--md-sys-color-surface')).not.toBe(lightSurface);
  });

  test('press shows a ripple from the pointer and clears on release', async ({ page }) => {
    await page.goto('/');
    const pressable = page.getByTestId('pressable').first();
    const box = (await pressable.boundingBox())!;

    await page.mouse.move(box.x + 20, box.y + 10);
    await expect(pressable).toHaveAttribute('data-hovered', 'true');
    await page.mouse.down();
    await expect(pressable).toHaveAttribute('data-pressed', 'true');
    // The ripple starts at the press point (rev. 26 renamed the origin property).
    expect(
      await pressable.evaluate((el) => el.style.getPropertyValue('--m3-ripple-origin-x')),
    ).toBe('20px');
    await page.mouse.up();
    await expect(pressable).not.toHaveAttribute('data-pressed');
    await expect(pressable).toContainText('Pressed 1 times');
  });

  test('state layer is a background layer and the focus ring an outline', async ({ page }) => {
    await page.goto('/');
    const pressable = page.getByTestId('pressable').first();
    const style = await pressable.evaluate((el) => {
      const s = getComputedStyle(el);
      return {
        backgroundImage: s.backgroundImage,
        position: s.position,
        overflow: s.overflow,
        positionedChildren: [...el.querySelectorAll('*')].filter((child) =>
          ['absolute', 'fixed'].includes(getComputedStyle(child).position),
        ).length,
      };
    });
    expect(style.backgroundImage).toContain('radial-gradient');
    expect(style.backgroundImage).toContain('linear-gradient');
    expect(style.position).toBe('static');
    expect(style.overflow).toBe('visible');
    expect(style.positionedChildren).toBe(0);

    await pressable.click();
    expect(await pressable.evaluate((el) => getComputedStyle(el).outlineStyle)).toBe('none');
    await page.keyboard.press('Shift+Tab');
    await page.keyboard.press('Tab');
    await expect(pressable).toHaveAttribute('data-focus-visible', 'true');
    const outline = await pressable.evaluate((el) => {
      const s = getComputedStyle(el);
      return { style: s.outlineStyle, width: s.outlineWidth, offset: s.outlineOffset };
    });
    expect(outline).toEqual({ style: 'solid', width: '3px', offset: '2px' });
  });

  test('stays intact when a consumer makes the root fixed and clips its parent', async ({
    page,
  }) => {
    await page.goto('/');
    const pressable = page.getByTestId('pressable').first();
    await pressable.evaluate((el) => {
      el.style.position = 'fixed';
      el.style.bottom = '16px';
      el.style.right = '16px';
      (el.parentElement as HTMLElement).style.overflow = 'hidden';
    });
    await pressable.focus();
    await page.keyboard.press('Enter');
    await expect(pressable).toContainText('Pressed 1 times');
    const style = await pressable.evaluate((el) => getComputedStyle(el).backgroundImage);
    expect(style).toContain('linear-gradient');
  });

  test('theme scopes resolve their own colours', async ({ page }) => {
    await page.goto('/');
    await page.getByLabel('Mode').selectOption('light');
    const scope = page.getByTestId('scope-forest');
    const scoped = await scope.evaluate((el) => {
      const s = getComputedStyle(el);
      return {
        scheme: s.colorScheme,
        primary: s.getPropertyValue('--md-sys-color-primary').trim(),
      };
    });
    expect(scoped.scheme).toBe('dark');
    expect(scoped.primary).not.toBe(await rootVar(page, '--md-sys-color-primary'));
  });

  test('a plain :root or [data-theme] rule overrides a colour role', async ({ page }) => {
    await page.goto('/');
    await page.getByLabel('Colour theme').selectOption('ocean');
    await page.getByLabel('Mode').selectOption('dark');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'ocean');
    const builtIn = await rootVar(page, '--md-sys-color-primary');
    const surface = await rootVar(page, '--md-sys-color-surface');

    // The themes' selectors have zero specificity, so a plain rule wins in every mode.
    const rootRule = await page.addStyleTag({
      content: ':root { --md-sys-color-primary: #0050c8; }',
    });
    expect(await rootVar(page, '--md-sys-color-primary')).toBe('#0050c8');
    expect(await rootVar(page, '--md-sys-color-surface')).toBe(surface);
    await rootRule.evaluate((el) => (el as HTMLStyleElement).remove());
    expect(await rootVar(page, '--md-sys-color-primary')).toBe(builtIn);

    await page.addStyleTag({
      content: "[data-theme='ocean'] { --md-sys-color-primary: #8a1c4a; }",
    });
    expect(await rootVar(page, '--md-sys-color-primary')).toBe('#8a1c4a');
    expect(await rootVar(page, '--md-sys-color-surface')).toBe(surface);
    // A scope in another theme keeps its own colours.
    const forest = await page
      .getByTestId('scope-forest')
      .evaluate((el) => getComputedStyle(el).getPropertyValue('--md-sys-color-primary').trim());
    expect(forest).not.toBe('#8a1c4a');
  });
});

test.describe('Pages Router', () => {
  test('ThemeScript applies the stored theme before hydration', async ({
    page,
    context,
    baseURL,
  }) => {
    const errors = collectConsoleErrors(page);
    await context.addCookies([
      {
        name: COOKIE,
        value: encode({ theme: 'rose', mode: 'dark', contrast: 'standard', motion: 'expressive' }),
        url: baseURL!,
      },
    ]);
    await page.goto('/pages-router');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'rose');
    await expect(page.locator('html')).toHaveAttribute('data-mode', 'dark');
    await expect(page.getByTestId('pages-theme')).toHaveText('rose · dark');

    await page.getByRole('button', { name: 'Toggle dark mode' }).click();
    await expect(page.locator('html')).toHaveAttribute('data-mode', 'light');
    const cookie = (await context.cookies()).find((c) => c.name === COOKIE);
    expect(decodeURIComponent(cookie!.value)).toContain('mode=light');
    expect(errors).toEqual([]);
  });
});

test.describe('Select and Autocomplete', () => {
  test('server-render their chosen values before hydration', async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto('/select');
    await expect(page.getByRole('button', { name: /Sort by/ })).toContainText('Price, low to high');
    await expect(page.getByRole('combobox', { name: 'City' })).toHaveValue('London');
    // A searchable Select with renderValue: the code shows, the name is in the field's name.
    const currency = page.getByRole('button', { name: /Currency/ });
    await expect(currency).toContainText('GBP');
    await expect(currency).toHaveAccessibleName(/Pound sterling/);
    await context.close();
  });

  test('hydrate without errors and open their menus', async ({ page }) => {
    const errors = collectConsoleErrors(page);
    await page.goto('/select');
    await page.getByRole('button', { name: /Sort by/ }).click();
    await expect(page.getByRole('listbox')).toBeVisible();
    await page.getByRole('option', { name: 'Newest first' }).click();
    await expect(page.getByRole('button', { name: /Sort by/ })).toContainText('Newest first');
    await page.getByRole('combobox', { name: 'City' }).fill('syd');
    await expect(page.getByRole('option', { name: 'Sydney' })).toBeVisible();
    await page.keyboard.press('Escape');
    await page.getByRole('button', { name: /Currency/ }).click();
    await page.getByRole('searchbox', { name: 'Search' }).fill('euro');
    await page.getByRole('option', { name: 'Euro' }).click();
    await expect(page.getByRole('button', { name: /Currency/ })).toContainText('EUR');
    expect(errors).toEqual([]);
  });
});
