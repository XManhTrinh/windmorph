import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { gotoReady } from './navigate';

/**
 * The docs content around the component pages: the Accessibility tab's sections, the
 * Guidelines' Do and Don't cards, the import line, the footer, the Windmorph Pro guide and
 * the components index filtered by URL.
 */

const SECTIONS = [
  'Keyboard',
  'Screen reader',
  'Focus',
  'Touch target',
  'Motion',
  'What you need to do',
];

async function expectNoAxeViolations(page: Page, label: string) {
  // A mode switch fades the colours: wait for what is still moving (looping animations
  // never finish, so they're left out), as the smoke suite does.
  await page.evaluate(() =>
    Promise.all(
      document
        .getAnimations()
        .filter((animation) => animation.effect?.getComputedTiming().endTime !== Infinity)
        .map((animation) => animation.finished.catch(() => undefined)),
    ),
  );
  const results = await new AxeBuilder({ page }).analyze();
  expect(
    results.violations,
    `axe violations on ${label}: ${results.violations.map((v) => v.id).join(', ')}`,
  ).toEqual([]);
}

/** Switches the loaded page to dark mode, as the theme CSS keys on `data-mode`. */
async function goDark(page: Page) {
  await page.evaluate(() => document.documentElement.setAttribute('data-mode', 'dark'));
}

test.describe('Accessibility tab', () => {
  for (const slug of ['button', 'dialog', 'skeleton', 'divider']) {
    test(`${slug}: the six sections, in order, listed in the outline`, async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await gotoReady(page, `/components/${slug}/accessibility`);
      const main = page.getByRole('main');
      await expect(main.getByRole('heading', { level: 2 })).toHaveText(SECTIONS);
      const outline = page.getByRole('navigation', { name: 'On this page' });
      await expect(outline.getByRole('link')).toHaveText(SECTIONS);
      // Each section has content: a table, a definition list, a list or a paragraph.
      for (const id of ['keyboard', 'screen-reader', 'focus', 'touch-target', 'motion']) {
        await expect(
          page.locator(`[data-a11y-section="${id}"]`).locator('table, dl, ul, p').first(),
        ).toBeVisible();
      }
    });
  }

  test('the keyboard table names its keys', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoReady(page, '/components/button/accessibility');
    const table = page.getByRole('table', { name: 'Button keyboard' });
    await expect(table.getByRole('columnheader')).toHaveText(['Key', 'Action', 'Where']);
    await expect(table.getByRole('rowheader').first()).toHaveText('Tab');
  });

  test('a section that does not apply says so, with a reason', async ({ page }) => {
    await gotoReady(page, '/components/divider/accessibility');
    await expect(
      page.locator('[data-a11y-section="keyboard"]').getByText('None.', { exact: true }),
    ).toBeVisible();
  });
});

test.describe('Do and Don’t cards', () => {
  test('pair live examples with a labelled sentence; the examples are inert', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoReady(page, '/components/button/guidelines');
    await expect(page.getByRole('heading', { level: 2, name: "Do and don't" })).toBeVisible();
    const dos = page.locator('[data-do-dont="do"]');
    const donts = page.locator('[data-do-dont="dont"]');
    await expect(dos).toHaveCount(2);
    await expect(donts).toHaveCount(2);
    await expect(dos.first().locator('figcaption')).toContainText('Do');
    await expect(donts.first().locator('figcaption')).toContainText("Don't");
    // The live example rendered real buttons.
    await expect(donts.first().locator('button')).toHaveCount(4);

    // No example can take focus: Tab passes from before the cards to after them.
    const examples = page.locator('[data-do-dont] [inert]');
    await expect(examples).toHaveCount(4);
    const focusable = await examples.evaluateAll((nodes) =>
      nodes.flatMap((node) =>
        [...node.querySelectorAll<HTMLElement>('button, a, input, [tabindex]')].map((element) => {
          element.focus();
          return document.activeElement === element;
        }),
      ),
    );
    expect(focusable.length).toBeGreaterThan(0);
    expect(focusable.every((focused) => !focused)).toBe(true);
    // Hidden from assistive tech: the cards' accessible content is their caption.
    await expect(page.getByRole('button', { name: 'Archive' })).toHaveCount(0);
    await expect(page.getByRole('figure')).toHaveCount(4);

    await expectNoAxeViolations(page, 'button guidelines (light)');
    await goDark(page);
    await expectNoAxeViolations(page, 'button guidelines (dark)');
  });

  for (const slug of [
    'icon-button',
    'fab',
    'text-field',
    'select',
    'dialog',
    'snackbar',
    'navigation-bar',
    'tabs',
    'chips',
  ]) {
    test(`${slug}: cards render and pass axe`, async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 900 });
      await gotoReady(page, `/components/${slug}/guidelines`);
      const cards = page.locator('[data-do-dont]');
      expect(await cards.count()).toBeGreaterThanOrEqual(2);
      await expectNoAxeViolations(page, `${slug} guidelines`);
    });
  }
});

test.describe('Import line', () => {
  test('copies the import and confirms in the snackbar', async ({ page, context, baseURL }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: baseURL });
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoReady(page, '/components/fab');
    const line = page.locator('[data-import-line]');
    await expect(line).toContainText("import { Fab, ExtendedFab } from '@windmorph/react';");
    await line.getByRole('button', { name: 'Copy import' }).click();
    await expect(page.getByText('Import copied')).toBeVisible();
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
      "import { Fab, ExtendedFab } from '@windmorph/react';",
    );
  });

  test('a Pro page imports from Windmorph Pro and links the Pro guide', async ({ page }) => {
    await gotoReady(page, '/components/skeleton/accessibility');
    await expect(page.locator('[data-import-line]')).toContainText(
      "import { Skeleton, SkeletonGroup } from '@windmorph/react-pro';",
    );
    await page.getByRole('link', { name: 'the Pro guide' }).click();
    await expect(page).toHaveURL(/\/pro$/);
  });
});

test('the footer links the repository, npm, the licence and the Pro guide', async ({ page }) => {
  await page.goto('/theming');
  const links = page.getByRole('contentinfo').getByRole('navigation', { name: 'Windmorph' });
  await expect(links.getByRole('link')).toHaveText([
    'GitHub',
    'npm',
    'MIT licence',
    'Windmorph Pro',
  ]);
  await expect(links.getByRole('link', { name: 'GitHub' })).toHaveAttribute(
    'href',
    'https://github.com/XManhTrinh/windmorph',
  );
  await expect(links.getByRole('link', { name: 'npm' })).toHaveAttribute(
    'href',
    'https://www.npmjs.com/package/@windmorph/react',
  );
  await expect(page.getByRole('contentinfo')).toContainText('Built with');
  await expect(
    page.getByRole('contentinfo').getByRole('link', { name: '@XManhTrinh' }),
  ).toBeVisible();
});

test.describe('Windmorph Pro guide', () => {
  test('is in the Guides navigation', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/theming');
    const guides = page.getByRole('navigation', { name: 'Guides' });
    await guides.getByRole('link', { name: 'Windmorph Pro' }).click();
    await expect(page).toHaveURL(/\/pro$/);
    await expect(page.getByRole('heading', { level: 1, name: 'Windmorph Pro' })).toBeVisible();
  });

  test('is found by the search', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/getting-started');
    await expect(
      page.locator('[data-ready]').filter({
        has: page.getByRole('combobox', { name: 'Search documentation' }),
      }),
    ).toHaveCount(1);
    await page.keyboard.press('ControlOrMeta+K');
    const view = page.getByRole('dialog', { name: 'Search documentation' });
    await view.getByRole('searchbox').fill('licence');
    await expect(view.getByRole('row', { name: /Windmorph Pro/ }).first()).toBeVisible();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/\/pro$/);
  });

  test('lists the Pro components and links the filtered index', async ({ page }) => {
    await page.goto('/pro');
    const included = page.locator('section').filter({
      has: page.getByRole('heading', { name: "What's included" }),
    });
    await expect(included.getByRole('link', { name: 'Skeleton' })).toHaveAttribute(
      'href',
      '/components/skeleton',
    );
    await included.getByRole('link', { name: 'Browse the Pro components' }).click();
    await expect(page).toHaveURL(/\/components\?filter=pro$/);
    await expect(page.getByRole('radio', { name: 'Pro' })).toBeChecked();
  });

  test('answers questions in an accordion', async ({ page }) => {
    await page.goto('/pro');
    const question = page.getByRole('button', { name: 'Do I need Tailwind CSS?' });
    await expect(question).toHaveAttribute('aria-expanded', 'false');
    await question.click();
    await expect(question).toHaveAttribute('aria-expanded', 'true');
    await expect(
      page.getByText(/link @windmorph\/react-pro\/styles.compiled.css alone/),
    ).toBeVisible();
  });

  test('passes axe in light and dark mode', async ({ page }) => {
    await page.goto('/pro');
    await expectNoAxeViolations(page, '/pro (light)');
    await goDark(page);
    await expectNoAxeViolations(page, '/pro (dark)');
  });
});

test('the components index opens filtered by its URL, and writes the filter back', async ({
  page,
}) => {
  await page.goto('/components?filter=pro');
  await expect(page.getByRole('radio', { name: 'Pro' })).toBeChecked();
  await expect(page.getByRole('status')).toHaveText(/^\d+ of \d+ components$/);
  await expect(page.getByRole('link', { name: /Skeleton/ }).first()).toBeVisible();
  await expect(page.getByRole('link', { name: /^Button\b/ })).toHaveCount(0);
  await page.getByRole('radio', { name: 'All' }).click();
  await expect(page).toHaveURL(/\/components$/);
  await page.getByRole('radio', { name: 'Expressive' }).click();
  await expect(page).toHaveURL(/\/components\?filter=expressive$/);
});

test.describe('No sideways scrolling', () => {
  for (const width of [390, 840, 1440]) {
    test(`at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      for (const path of [
        '/pro',
        '/components/button/accessibility',
        '/components/dialog/accessibility',
        '/components/button/guidelines',
        '/components/navigation-bar/guidelines',
        '/components/dialog/guidelines',
        '/components/skeleton',
        '/components/rich-message-field',
      ]) {
        await gotoReady(page, path);
        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth - window.innerWidth,
        );
        expect(overflow, `${path} scrolls sideways at ${width}px`).toBeLessThanOrEqual(0);
      }
    });
  }
});
