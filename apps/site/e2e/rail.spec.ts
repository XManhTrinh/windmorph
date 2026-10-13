import { expect, test } from '@playwright/test';

/**
 * The medium+ navigation rail. Group triggers are LINKS to each group's first page that also
 * open a secondary disclosure panel on hover and focus. On a component detail page the panel
 * is a PERMANENT pinned pane for the active group; elsewhere it is a transient overlay.
 */
test.describe('Navigation rail flyout (overlay, non-detail page)', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/components');
  });

  test('hover opens the Actions panel and reveals its component links', async ({ page }) => {
    const trigger = page.getByRole('link', { name: 'Actions', exact: true });
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await expect(trigger).toHaveAttribute('href', '/components/button');
    await trigger.hover();
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    const flyout = page.getByRole('navigation', { name: 'Actions' });
    await expect(flyout).toBeVisible();
    await expect(
      flyout.getByRole('link', { name: 'Button Expressive', exact: true }),
    ).toBeVisible();
  });

  test('links show Expressive and Pro chips, which are part of their names', async ({ page }) => {
    await page.getByRole('link', { name: 'Inputs', exact: true }).hover();
    const flyout = page.getByRole('navigation', { name: 'Inputs & selection' });
    await expect(flyout.getByRole('link', { name: 'Phone field Pro', exact: true })).toBeVisible();
    await expect(
      flyout.getByRole('link', { name: 'Slider Expressive', exact: true }),
    ).toBeVisible();
    // An M3 component that M3 Expressive didn't change has no chip.
    await expect(flyout.getByRole('link', { name: 'Select', exact: true })).toBeVisible();
  });

  test('every name fits beside its chip, even emphasised as the current page', async ({ page }) => {
    for (const slug of [
      'progress',
      'button-group',
      'navigation-rail',
      'date-picker',
      'phone-field',
    ]) {
      await page.goto(`/components/${slug}`);
      const names = page.locator('nav[data-pinned] li a > span:first-child');
      await expect(names.first()).toBeVisible();
      const cut = await names.evaluateAll((spans) =>
        spans.filter((span) => span.scrollWidth > span.clientWidth).map((span) => span.textContent),
      );
      expect(cut, slug).toEqual([]);
    }
  });

  test('focus opens the panel; Escape closes it and restores focus', async ({ page }) => {
    const trigger = page.getByRole('link', { name: 'Actions', exact: true });
    await trigger.focus();
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await expect(page.getByRole('navigation', { name: 'Actions' })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await expect(trigger).toBeFocused();
  });

  test('pointer leaving the rail and panel closes it', async ({ page }) => {
    const trigger = page.getByRole('link', { name: 'Actions', exact: true });
    await trigger.hover();
    await expect(page.getByRole('navigation', { name: 'Actions' })).toBeVisible();
    await page.mouse.move(1000, 800);
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  test('the panel opens flush to the rail inline-end edge (LTR)', async ({ page }) => {
    const rail = page.locator('nav[aria-label="Components and settings"]');
    const railBox = await rail.boundingBox();
    await page.getByRole('link', { name: 'Actions', exact: true }).hover();
    const flyout = page.getByRole('navigation', { name: 'Actions' });
    await expect(flyout).toBeVisible();
    // Let the slide-in transition settle before measuring the resting position.
    await page.waitForTimeout(350);
    const flyoutBox = await flyout.boundingBox();
    expect(railBox!.x).toBeLessThan(2);
    expect(Math.abs(flyoutBox!.x - (railBox!.x + railBox!.width))).toBeLessThanOrEqual(1);
    expect(flyoutBox!.height).toBeGreaterThanOrEqual(880);
  });

  test('hover-intent: moving diagonally from the trigger into the panel keeps it open', async ({
    page,
  }) => {
    const trigger = page.getByRole('link', { name: 'Actions', exact: true });
    await trigger.hover();
    const flyout = page.getByRole('navigation', { name: 'Actions' });
    await expect(flyout).toBeVisible();
    // Cross the rail→panel gap and land on a link; the close delay must bridge the gap.
    const fab = flyout.getByRole('link', { name: 'FAB Expressive', exact: true });
    await fab.hover();
    await expect(flyout).toBeVisible();
    await fab.click();
    // The FAB page's Playground reflects its state in the query string, so allow one.
    await expect(page).toHaveURL(/\/components\/fab(\?|$)/);
  });
});

/** The fixed rail and the sticky top app bar must hold position while the page scrolls. */
test.describe('Fixed chrome stays put on scroll', () => {
  for (const path of ['/components/button', '/']) {
    test(`top app bar stays pinned and the rail stays fixed on ${path}`, async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 900 });
      await page.goto(path);
      const bar = page.locator('header:visible').first();
      const rail = page.locator('nav[aria-label="Components and settings"]');
      await expect(bar).toBeVisible();
      const barBefore = await bar.boundingBox();
      const railBefore = await rail.boundingBox();
      expect(barBefore!.y).toBeLessThanOrEqual(1);
      await page.evaluate(() => window.scrollTo(0, 1200));
      await page.waitForTimeout(100);
      const scrollY = await page.evaluate(() => window.scrollY);
      expect(scrollY).toBeGreaterThan(300);
      const barAfter = await bar.boundingBox();
      const railAfter = await rail.boundingBox();
      expect(barAfter!.y).toBeLessThanOrEqual(1);
      expect(railAfter!.y).toBeLessThanOrEqual(1);
      expect(railAfter!.height).toBe(railBefore!.height);
    });
  }
});

/** On a component detail page the group panel is pinned into the layout, not an overlay. */
test.describe('Pinned second menu on component pages', () => {
  test('the active group panel is permanently visible and the current page is marked', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/components/button');
    // Visible with NO hover.
    const flyout = page.getByRole('navigation', { name: 'Actions' });
    await expect(flyout).toBeVisible();
    // The current page's item is active; the rail group reads as current.
    const active = flyout.getByRole('link', { name: 'Button Expressive', exact: true });
    await expect(active).toHaveAttribute('aria-current', 'page');
    await expect(page.getByRole('link', { name: 'Actions', exact: true })).toHaveAttribute(
      'data-current',
      'true',
    );
    // Content is pushed right of the rail (96) + panel (256) = 352px.
    const main = page.locator('#main-content');
    const mainBox = await main.boundingBox();
    expect(mainBox!.x).toBeGreaterThanOrEqual(348);
  });

  test('hovering another group previews it, then reverts to the pinned group on leave', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/components/button');
    await page.getByRole('link', { name: 'Inputs', exact: true }).hover();
    await expect(page.getByRole('navigation', { name: 'Inputs & selection' })).toBeVisible();
    // Leave the rail entirely; it reverts to the pinned Actions panel.
    await page.mouse.move(1000, 800);
    await expect(page.getByRole('navigation', { name: 'Actions' })).toBeVisible();
  });

  test('clicking a child from the home overlay lands pinned with that child active', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/');
    const flyout = page.getByRole('navigation', { name: 'Actions' });
    await page.getByRole('link', { name: 'Actions', exact: true }).hover();
    await expect(flyout).toBeVisible();
    await flyout.getByRole('link', { name: 'Icon button Expressive', exact: true }).click();
    await expect(page).toHaveURL(/\/components\/icon-button(\?|$)/);
    // The same drawer stays open and becomes pinned with the new child active.
    await expect(flyout).toBeVisible();
    await expect(
      flyout.getByRole('link', { name: 'Icon button Expressive', exact: true }),
    ).toHaveAttribute('aria-current', 'page');
    // The content margin glides (~300ms) from rail-only to rail+drawer; wait for it to settle.
    await page.waitForTimeout(450);
    const mainBox = await page.locator('#main-content').boundingBox();
    expect(mainBox!.x).toBeGreaterThanOrEqual(300);
  });

  test('the gallery index keeps the panel as a transient overlay (no push)', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/components');
    // The panel stays mounted but closed (inert, zero-width) — not a pinned/visible pane.
    await expect(page.getByRole('navigation', { name: 'Actions' })).toBeHidden();
    const main = page.locator('#main-content');
    const mainBox = await main.boundingBox();
    // Content is inset only past the rail (~96px), not the panel.
    expect(mainBox!.x).toBeLessThan(200);
  });
});

/** Under RTL the rail is on the inline-start (right) edge and the panel opens to its left. */
test.describe('Navigation rail under RTL', () => {
  test('rail is on the right edge and the panel sits flush to its inline-end', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/components/button');
    await page
      .getByRole('navigation', { name: 'Components and settings' })
      .getByRole('button', { name: 'Display settings' })
      .click();
    const sheet = page.getByRole('dialog', { name: 'Display' });
    await sheet.getByText('Right to left').click();
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    await page.keyboard.press('Escape');
    await expect(sheet).toBeHidden();

    const rail = page.locator('nav[aria-label="Components and settings"]');
    const railBox = await rail.boundingBox();
    const viewport = page.viewportSize()!;
    expect(railBox!.x + railBox!.width).toBeGreaterThanOrEqual(viewport.width - 1);

    // The pinned Actions panel sits to the left of the rail (its right edge meets the rail).
    const flyout = page.getByRole('navigation', { name: 'Actions' });
    await expect(flyout).toBeVisible();
    const flyoutBox = await flyout.boundingBox();
    expect(Math.abs(flyoutBox!.x + flyoutBox!.width - railBox!.x)).toBeLessThanOrEqual(1);
  });
});

/** The Guides destination: every guide, pinned on a guide page like a component group. */
test.describe('Guides in the rail', () => {
  test('lists the guides and pins them on a guide page', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/theming');
    const trigger = page.getByRole('link', { name: 'Guides', exact: true });
    await expect(trigger).toHaveAttribute('data-current', 'true');
    await expect(trigger).toHaveAttribute('href', '/getting-started');
    const flyout = page.getByRole('navigation', { name: 'Guides' });
    await expect(flyout).toBeVisible();
    await expect(flyout.getByRole('link')).toHaveText([
      'Getting Started',
      'Theming',
      'Customisation',
      'Motion',
      'Accessibility',
      'Next.js',
      'From Compose',
      'Spec status',
    ]);
    await expect(flyout.getByRole('link', { name: 'Theming' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    await flyout.getByRole('link', { name: 'Motion' }).click();
    await expect(page).toHaveURL(/\/motion$/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Motion');
  });

  test('the top bar keeps only the search', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/theming');
    const bar = page.locator('header:visible').first();
    await expect(bar.getByRole('combobox', { name: 'Search documentation' })).toBeVisible();
    await expect(bar.getByRole('link')).toHaveCount(0);
  });
});
