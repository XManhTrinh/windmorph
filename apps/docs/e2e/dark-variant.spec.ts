import { expect, test } from '@playwright/test';
import { openStory } from './story';

const STORY = 'tokens-dark-variant--nested-scopes';

/** What `dark:` shows in each marker: the nearest part's mode, `system` from the device. */
const expected = (page: 'light' | 'dark', device: 'light' | 'dark') => ({
  page: page === 'dark' ? 'Dark' : 'Light',
  'light-in-page': 'Light',
  'dark-in-light': 'Dark',
  'light-in-dark-in-light': 'Light',
  'dark-in-page': 'Dark',
  'system-in-page': device === 'dark' ? 'Dark' : 'Light',
});

test.describe('dark: follows the nearest ThemeScope', () => {
  for (const device of ['light', 'dark'] as const) {
    for (const mode of ['light', 'dark'] as const) {
      test(`a ${mode} page on a ${device} device`, async ({ page }) => {
        await page.emulateMedia({ colorScheme: device });
        await openStory(page, STORY, { mode });
        for (const [id, shown] of Object.entries(expected(mode, device))) {
          // What's drawn (`innerText`), not the hidden span's text too.
          await expect(page.getByTestId(id), id).toHaveText(`${id}: ${shown}`, {
            useInnerText: true,
          });
        }
      });
    }
  }
});
