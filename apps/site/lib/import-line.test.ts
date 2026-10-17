import * as core from '@windmorph/react';
import * as pro from '@windmorph/react-pro';
import * as richText from '@windmorph/react-pro/rich-text';
import { describe, expect, it } from 'vitest';
import { COMPONENT_META } from '../content/components/catalog';
import { importEntry, importLine, importNames, type ImportEntry } from './import-line';

// The site may not import the primitives entry statically (its UI comes from the main
// entries); this only reads the names it exports.
const primitives = (await import('@windmorph/react/primitives')) as Record<string, unknown>;

const ENTRIES: Record<ImportEntry, Record<string, unknown>> = {
  '@windmorph/react': core,
  '@windmorph/react/primitives': primitives,
  '@windmorph/react-pro': pro,
  '@windmorph/react-pro/rich-text': richText,
};

describe('component import lines', () => {
  it.each(COMPONENT_META.map((meta) => [meta.slug, meta] as const))(
    '%s imports only names its entry exports',
    (_, meta) => {
      const names = importNames(meta);
      expect(names.length).toBeGreaterThan(0);
      const entry = ENTRIES[importEntry(meta)];
      for (const name of names)
        expect(entry, `${name} in ${importEntry(meta)}`).toHaveProperty(name);
    },
  );

  it('imports Pro pages from Windmorph Pro and the rest from the core', () => {
    for (const meta of COMPONENT_META) {
      expect(importEntry(meta).startsWith('@windmorph/react-pro')).toBe(Boolean(meta.pro));
    }
  });

  it('writes one statement', () => {
    expect(importLine({ slug: 'fab', propsComponents: ['Fab', 'ExtendedFab'], hooks: [] })).toBe(
      "import { Fab, ExtendedFab } from '@windmorph/react';",
    );
  });
});
