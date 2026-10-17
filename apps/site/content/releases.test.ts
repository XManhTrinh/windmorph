import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { RELEASES } from './releases';

const corePackage = JSON.parse(
  readFileSync(resolve(process.cwd(), '../../packages/react/package.json'), 'utf8'),
) as { version: string };

describe('RELEASES', () => {
  it('dates every release but the newest, newest first', () => {
    const dated = RELEASES.slice(1);
    for (const release of dated)
      expect(release.date, release.version).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    const dates = RELEASES.flatMap((release) => (release.date ? [release.date] : []));
    expect(dates).toEqual([...dates].sort().reverse());
  });

  it('dates a version once the core package is published at it', () => {
    const published = RELEASES.find((release) => release.version === corePackage.version);
    if (published)
      expect(published.date, `set the ${published.version} release date`).toBeDefined();
  });
});
