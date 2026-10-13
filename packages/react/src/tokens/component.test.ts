// @vitest-environment node
import { readFile, readdir } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';

describe('component tokens in classes', () => {
  it('never puts a private token after an operator in an arbitrary value', async () => {
    // Tailwind turns `_` into a space in arbitrary values, and `+var(--_x)` inside a `calc()`
    // came out as `var(-- x)`, which Next's CSS parser rejects (found in an app, 2026-10-11).
    // `[var(--_x)]`, `calc((var(--_x)…` and `_var(--_x)` compile correctly; compute anything
    // more in a token's `derived` value or an inline style instead.
    const root = new URL('../', import.meta.url);
    const entries = await readdir(root, { recursive: true });
    const sources = entries.filter((file) => /\.tsx?$/u.test(file) && !/\.test\.tsx?$/u.test(file));
    const offenders: string[] = [];
    for (const file of sources) {
      const text = await readFile(new URL(file, root), 'utf8');
      for (const [match] of text.matchAll(/\[[^\]\s'"]*[-+*/,]var\(--_[^\]\s'"]*\]/gu)) {
        offenders.push(`${file}: ${match}`);
      }
    }
    expect(offenders).toEqual([]);
  });
});
