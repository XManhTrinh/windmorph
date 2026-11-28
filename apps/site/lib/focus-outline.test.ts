import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

/*
 * Tailwind v4's `outline-none` sets `--tw-outline-style: none`, and `focus-visible:outline-2`
 * reads that variable, so a class list with both draws a 2px outline of style `none`: no focus
 * indicator at all (WCAG 2.4.7). Such a list must name the style too (`focus-visible:outline-solid`).
 */

const ROOTS = ['app', 'components', 'content', 'examples'].map((dir) =>
  resolve(process.cwd(), dir),
);

function sources(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return sources(path);
    return /\.(ts|tsx)$/.test(name) && !name.endsWith('.test.ts') ? [path] : [];
  });
}

describe('focus outlines', () => {
  it('a class list that removes the outline and draws one on focus names its style', () => {
    const broken = ROOTS.flatMap(sources).flatMap((path) =>
      readFileSync(path, 'utf8')
        .split('\n')
        .map((line, index) => ({ line, at: `${path}:${index + 1}` }))
        .filter(
          ({ line }) =>
            /\boutline-none\b/.test(line) &&
            /focus-visible:-?outline-\d/.test(line) &&
            !line.includes('focus-visible:outline-solid'),
        )
        .map(({ at }) => at),
    );
    expect(broken).toEqual([]);
  });
});
