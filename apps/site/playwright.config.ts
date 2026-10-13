import { defineConfig, devices } from '@playwright/test';

const PORT = 4317;
const DEV_PORT = 4319;

export default defineConfig({
  testDir: './e2e',
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  use: { trace: 'retain-on-failure' },
  projects: [
    {
      // Every suite against the static export (`turbo run test:e2e` builds first, producing out/).
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], baseURL: `http://localhost:${PORT}` },
    },
    {
      // The menu suite again under `next dev`: development resolves client references
      // lazily, so collection items built in a server component only fail there.
      name: 'next-dev',
      testMatch: 'menus.spec.ts',
      // The dev server compiles each page on its first request.
      timeout: 90_000,
      use: { ...devices['Desktop Chrome'], baseURL: `http://localhost:${DEV_PORT}` },
    },
  ],
  webServer: [
    {
      command: `sirv out --port ${PORT} --quiet`,
      port: PORT,
      reuseExistingServer: !process.env.CI,
    },
    {
      command: `next dev --webpack --port ${DEV_PORT}`,
      env: { NEXT_DIST_DIR: '.next-e2e' },
      port: DEV_PORT,
      reuseExistingServer: !process.env.CI,
      timeout: 180_000,
    },
  ],
});
