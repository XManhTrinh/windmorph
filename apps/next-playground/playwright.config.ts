import { defineConfig, devices } from '@playwright/test';

const PORT = 3917;

export default defineConfig({
  testDir: './e2e',
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  use: { baseURL: `http://localhost:${PORT}`, trace: 'retain-on-failure' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  // Runs against the production build (`turbo run test:e2e` builds first).
  webServer: {
    command: `next start -p ${PORT}`,
    port: PORT,
    reuseExistingServer: !process.env.CI,
  },
});
