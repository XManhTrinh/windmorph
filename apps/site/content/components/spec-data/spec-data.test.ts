import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { COMPONENT_META } from '../catalog';
import { SPEC_DATA } from '.';
import { exampleLabel, specStatusRows } from './status';

const siteRoot = process.cwd();
const pages = COMPONENT_META.filter((meta) => meta.railGroup !== 'primitives');

/** A page's content file, which renders its examples. */
function contentOf(slug: string): string {
  return readFileSync(resolve(siteRoot, 'content/components', `${slug}.tsx`), 'utf8');
}

describe('spec data', () => {
  it('has an entry for every component page, and only for them', () => {
    const slugs = new Set(pages.map((meta) => meta.slug));
    for (const meta of pages) {
      expect(SPEC_DATA[meta.slug], `${meta.slug} has no spec data`).toBeDefined();
    }
    for (const slug of Object.keys(SPEC_DATA)) {
      expect(slugs.has(slug), `spec data for unknown page "${slug}"`).toBe(true);
    }
  });

  it('links each M3 component to its spec page, and no Pro component', () => {
    for (const meta of pages) {
      const data = SPEC_DATA[meta.slug];
      if (!data) continue;
      if (meta.pro) expect(data.spec, `${meta.slug} is Pro, not in M3`).toBeUndefined();
      else expect(data.spec, `${meta.slug} needs its spec page`).toMatch(/^[a-z-]+\/specs$/);
    }
  });

  for (const meta of pages) {
    it(`${meta.slug}: every listed variant and configuration has a live example`, () => {
      const data = SPEC_DATA[meta.slug];
      if (!data) return;
      expect(data.covers.length, `${meta.slug} covers nothing`).toBeGreaterThan(0);
      const names = data.covers.map((item) => item.name);
      expect(new Set(names).size, `${meta.slug} lists an item twice`).toBe(names.length);
      const content = contentOf(meta.slug);
      for (const item of data.covers) {
        expect(item.examples.length, `${meta.slug} "${item.name}" has no example`).toBeGreaterThan(
          0,
        );
        for (const id of item.examples) {
          const file = `${id}.tsx`;
          expect(existsSync(resolve(siteRoot, 'examples', file)), `examples/${file}`).toBe(true);
          const base = id.split('/').pop()!;
          // The page reads the example's source and shows it in an example viewer.
          expect(content, `${meta.slug} doesn't read ${file}`).toContain(`'${file}'`);
          expect(content, `${meta.slug} doesn't render ${base}.tsx`).toContain(
            `fileName="${base}.tsx"`,
          );
        }
      }
    });
  }

  it('gives a reason for every page without a playground, and none for the others', () => {
    for (const meta of pages) {
      const reason = SPEC_DATA[meta.slug]?.showcaseReason;
      if (meta.playground === 'full') {
        expect(reason, `${meta.slug} has a playground`).toBeUndefined();
      } else {
        expect(reason, `${meta.slug} needs a showcaseReason`).toBeTruthy();
      }
    }
  });

  it('closes every `code` span in its text', () => {
    for (const [slug, data] of Object.entries(SPEC_DATA)) {
      const texts = [
        ...data.covers.map((item) => item.name),
        ...[
          ...(data.differences ?? []),
          ...(data.extensions ?? []),
          ...(data.notBuilt ?? []),
        ].flatMap((note) => [note.item, note.note]),
        ...(data.compose ?? []).flatMap((mapping) => [
          mapping.composable,
          mapping.component,
          mapping.note ?? '',
          ...(mapping.params ?? []).flatMap((param) => [
            param.compose,
            param.windmorph,
            param.note ?? '',
          ]),
        ]),
        data.showcaseReason ?? '',
      ];
      for (const text of texts) {
        expect(text.split('`').length % 2, `${slug}: unclosed \` in "${text}"`).toBe(1);
      }
    }
  });
});

describe('spec status rows', () => {
  it('names an example after its file, without the words it shares with its folder', () => {
    expect(exampleLabel('button/button-variants')).toBe('Variants');
    expect(exampleLabel('button-group/button-group-connected')).toBe('Connected');
    expect(exampleLabel('toolbars/toolbar-docked')).toBe('Docked');
    expect(exampleLabel('fab/fab-extended-collapse')).toBe('Extended collapse');
  });

  it('lists covered items first, linked to their examples, then the notes', () => {
    const rows = specStatusRows('button', {
      covers: [{ name: 'Toggle', kind: 'variant', examples: ['button/button-toggle'] }],
      differences: [{ item: 'Corners', note: 'From the spec.' }],
      extensions: [{ item: 'Links', note: 'An `href` renders a link.' }],
      notBuilt: [{ item: 'Trailing icon', note: 'Not in M3.' }],
    });
    expect(rows.map((row) => row.status)).toEqual(['built', 'differs', 'extension', 'not-built']);
    expect(rows[0]!.examples).toEqual([
      {
        id: 'button/button-toggle',
        label: 'Toggle',
        href: '/components/button#example-button-toggle',
      },
    ]);
  });
});
