import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { describe, it } from 'node:test';

// The site's and the playground's CI jobs run in the official Playwright image, which holds
// the browsers of exactly one Playwright version: a tag behind `@playwright/test` fails every
// test with "Executable doesn't exist". (The Storybook suite reads the version itself,
// scripts/storybook-e2e-linux.mjs.)
const workflow = readFileSync(new URL('../.github/workflows/ci.yml', import.meta.url), 'utf8');
const tags = [...workflow.matchAll(/mcr\.microsoft\.com\/playwright:v([\w.-]+?)-noble/g)].map(
  (match) => match[1],
);

describe("CI's Playwright image", () => {
  it('runs the site build, the site smoke suite and the playground suite', () => {
    assert.equal(tags.length, 3);
  });

  for (const app of ['site', 'next-playground']) {
    it(`is the version of ${app}'s @playwright/test`, () => {
      const require = createRequire(new URL(`../apps/${app}/package.json`, import.meta.url));
      const { version } = JSON.parse(
        readFileSync(require.resolve('@playwright/test/package.json'), 'utf8'),
      );
      assert.deepEqual([...new Set(tags)], [version]);
    });
  }
});
