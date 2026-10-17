import { defineConfig, devices } from '@playwright/test';

/** Override with `E2E_PORT` to run several checkouts' suites side by side. */
const PORT = Number(process.env.E2E_PORT ?? 6007);

export default defineConfig({
  testDir: './e2e',
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  // Baselines are platform-specific; CI must render them in the same container image.
  snapshotPathTemplate:
    '{testDir}/__screenshots__/{testFilePath}/{arg}-{projectName}-{platform}{ext}',
  expect: {
    toHaveScreenshot: { animations: 'disabled', caret: 'hide', maxDiffPixelRatio: 0.0002 },
  },
  use: { baseURL: `http://localhost:${PORT}`, trace: 'retain-on-failure' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'], deviceScaleFactor: 1 } }],
  // Serves the static Storybook build (`turbo run test:e2e` builds it first). `--dev` reads
  // files per request, so a reused server never serves a previous build's asset list.
  webServer: {
    command: `sirv storybook-static --port ${PORT} --quiet --dev`,
    port: PORT,
    reuseExistingServer: !process.env.CI,
  },
});
