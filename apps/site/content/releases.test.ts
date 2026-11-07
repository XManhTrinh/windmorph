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

  it('has notes, dated, for the version the core package is at', () => {
    // The Version packages PR moves the version: it must bring the release's notes and date,
    // so What's new never falls behind npm (0.1.1 was missing from it, 2026-11-07).
    const current = RELEASES.find((release) => release.version === corePackage.version);
    expect(current, `add ${corePackage.version} to content/releases.tsx`).toBeDefined();
    expect(current?.date, `set the ${corePackage.version} release date`).toBeDefined();
  });
});
