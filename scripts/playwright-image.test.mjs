import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { describe, it } from 'node:test';

// The site's and the playground's CI jobs run in the official Playwright image, which holds
// the browsers of exactly one Playwright version: a tag behind `@playwright/test` fails every
// test with "Executable doesn't exist". Each is pinned by its digest too, and the Storybook
// suite (scripts/storybook-e2e-linux.mjs) runs the image the workflow pins. With a digest,
// Docker ignores the tag, so a tag moved without its digest would still run the old image.
const workflow = readFileSync(new URL('../.github/workflows/ci.yml', import.meta.url), 'utf8');
const images = [...workflow.matchAll(/mcr\.microsoft\.com\/playwright:[^\s'"]+/g)].map(
  (match) => match[0],
);
const tags = images.map((image) => /:v([\w.-]+?)-noble/.exec(image)?.[1]);

describe("CI's Playwright image", () => {
  it('runs the site build, the site smoke suite and the playground suite', () => {
    assert.equal(images.length, 3);
  });

  it('is one image, pinned by its digest', () => {
    for (const image of images) assert.match(image, /:v[\w.-]+-noble@sha256:[0-9a-f]{64}$/);
    assert.equal(new Set(images).size, 1);
  });

  // The Storybook suite's `docs` too: scripts/storybook-e2e-linux.mjs runs it in this image.
  for (const app of ['site', 'next-playground', 'docs']) {
    it(`is the version of ${app}'s @playwright/test`, () => {
      const require = createRequire(new URL(`../apps/${app}/package.json`, import.meta.url));
      const { version } = JSON.parse(
        readFileSync(require.resolve('@playwright/test/package.json'), 'utf8'),
      );
      assert.deepEqual([...new Set(tags)], [version]);
    });
  }
});
