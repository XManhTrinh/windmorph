import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { COMPONENT_META_MAP } from './catalog';
import { DO_DONT } from './do-dont';

const examplesDir = resolve(dirname(fileURLToPath(import.meta.url)), '../../examples');

const cards = Object.entries(DO_DONT).flatMap(([slug, pairs]) =>
  pairs.flatMap((pair) => [
    { slug, kind: 'do' as const, card: pair.do },
    { slug, kind: 'dont' as const, card: pair.dont },
  ]),
);

describe('Do and Don’t cards', () => {
  it('cover ten component pages that exist', () => {
    expect(Object.keys(DO_DONT)).toHaveLength(10);
    for (const slug of Object.keys(DO_DONT)) expect(COMPONENT_META_MAP[slug], slug).toBeDefined();
  });

  it.each(cards.map((entry) => [`${entry.slug} ${entry.card.name}`, entry] as const))(
    '%s points at a real example and has one sentence',
    async (_, { kind, card }) => {
      const file = resolve(examplesDir, `${card.file}.tsx`);
      expect(existsSync(file), card.file).toBe(true);
      const module = (await import(/* @vite-ignore */ file)) as Record<string, unknown>;
      expect(typeof module[card.name], `${card.file} exports ${card.name}`).toBe('function');
      expect(card.text).toMatch(/^[A-Z].*[.]$/);
      expect(card.text.split(/[.!?]\s/)).toHaveLength(1);
      if (kind === 'dont') expect(card.text).toMatch(/^Don't /);
    },
  );
});
