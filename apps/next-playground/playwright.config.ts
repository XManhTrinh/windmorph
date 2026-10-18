import { defineConfig, devices } from '@playwright/test';

const PORT = 3917;
const DEV_PORT = 3919;

export default defineConfig({
  testDir: './e2e',
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  use: { trace: 'retain-on-failure' },
  projects: [
    {
      // Every suite against the production build (`turbo run test:e2e` builds first).
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], baseURL: `http://localhost:${PORT}` },
    },
    {
      // The server-components suite again under `next dev`: development resolves client
      // references lazily and reports hydration mismatches in full.
      name: 'next-dev',
      testMatch: 'server-components.spec.ts',
      // The dev server compiles the page on its first request.
      timeout: 120_000,
      use: { ...devices['Desktop Chrome'], baseURL: `http://localhost:${DEV_PORT}` },
    },
  ],
  webServer: [
    {
      command: `next start -p ${PORT}`,
      port: PORT,
      reuseExistingServer: !process.env.CI,
    },
    {
      // Its own build directory, so it runs beside `next start` and a developer's `next dev`.
      command: `next dev --port ${DEV_PORT}`,
      env: { NEXT_DIST_DIR: '.next-e2e' },
      port: DEV_PORT,
      reuseExistingServer: !process.env.CI,
      timeout: 180_000,
    },
  ],
});
