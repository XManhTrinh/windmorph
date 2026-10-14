import { defineConfig, devices } from '@playwright/test';

/** Override with `E2E_PORT` (and the dev server with `E2E_DEV_PORT`) to run several checkouts side by side. */
const PORT = Number(process.env.E2E_PORT ?? 4317);
const DEV_PORT = Number(process.env.E2E_DEV_PORT ?? 4319);

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
      // The dev server compiles each page on its first request, and each live example's chunk
      // when the page asks for it. Under load a first compile (`/components/alert`) used up the
      // whole 90s test, so a navigation gets up to 2 minutes, the test 3, and the wait for the
      // examples 30s.
      timeout: 180_000,
      expect: { timeout: 30_000 },
      use: {
        ...devices['Desktop Chrome'],
        baseURL: `http://localhost:${DEV_PORT}`,
        navigationTimeout: 120_000,
      },
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
