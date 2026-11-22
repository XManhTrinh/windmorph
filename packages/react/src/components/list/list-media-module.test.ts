// @vitest-environment node
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

/*
 * Image and avatar rows import `ListMedia`; the video's duration (its formatting, words and
 * locale) lives in `ListItemVideo`, so a list without videos doesn't carry it.
 */
describe('ListMedia module', () => {
  it('leaves the duration code to ListItemVideo', () => {
    const source = readFileSync(new URL('./ListMedia.tsx', import.meta.url), 'utf8');
    expect(source).not.toMatch(/format-duration|use-labels|use-locale|ListItemVideo'/);
  });
});
