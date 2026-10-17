#!/usr/bin/env node
/*
 * Runs the Storybook Playwright suite (`apps/docs/e2e`) on Linux, in the official Playwright
 * image for the installed `@playwright/test` version, so its screenshots match the
 * `*-chromium-linux.png` baselines CI compares against. Any argument is passed to
 * `playwright test`:
 *
 *   pnpm test:e2e:linux                                   # compare against the Linux baselines
 *   pnpm test:e2e:linux button.spec.ts                    # one spec
 *   pnpm test:e2e:linux --update-snapshots=all            # re-record the Linux baselines
 *   pnpm test:e2e:linux --shard=1/3                       # one CI shard
 *
 * It serves the static Storybook build in `apps/docs/storybook-static`, so build it first
 * (`pnpm turbo run build --filter=docs`). The image always runs as `linux/arm64`, like CI's
 * runners (`ubuntu-24.04-arm`): an x86 Chromium can rasterise a few pixels differently. That
 * is native on an Apple silicon Mac, and emulated (slower) on an x86 machine.
 *
 * The checkout is mounted at its own path, so the workspace's `node_modules` symlinks resolve
 * inside the container. The test runner, its config and the static server are plain
 * JavaScript, so packages installed on another platform work there.
 */
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const docs = join(root, 'apps', 'docs');

const require = createRequire(join(docs, 'package.json'));
const { version } = JSON.parse(
  readFileSync(require.resolve('@playwright/test/package.json'), 'utf8'),
);
const image = `mcr.microsoft.com/playwright:v${version}-noble`;

if (!existsSync(join(docs, 'storybook-static', 'iframe.html'))) {
  console.error(
    'apps/docs/storybook-static is missing: run `pnpm turbo run build --filter=docs` first.',
  );
  process.exit(1);
}

const passEnv = ['CI', 'E2E_PORT'].flatMap((name) =>
  process.env[name] === undefined ? [] : ['--env', `${name}=${process.env[name]}`],
);
const user =
  typeof process.getuid === 'function' ? ['--user', `${process.getuid()}:${process.getgid()}`] : [];

const result = spawnSync(
  'docker',
  [
    'run',
    '--rm',
    '--init',
    '--ipc=host',
    '--platform=linux/arm64',
    ...user,
    '--env',
    'HOME=/tmp',
    '--env',
    `PATH=${join(docs, 'node_modules', '.bin')}:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin`,
    ...passEnv,
    '--volume',
    `${root}:${root}`,
    '--workdir',
    docs,
    image,
    'node',
    require.resolve('@playwright/test/cli'),
    'test',
    ...process.argv.slice(2),
  ],
  { stdio: 'inherit' },
);

if (result.error) {
  console.error(`Couldn't run Docker: ${result.error.message}`);
  process.exit(1);
}
process.exit(result.status ?? 1);
