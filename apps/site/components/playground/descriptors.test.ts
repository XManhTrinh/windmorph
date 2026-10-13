import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { COMPONENT_META } from '../../content/components/catalog';
import type { PropsRecord } from '../../lib/component-props';
import { inferControls } from './controls-model';
import { PLAYGROUND_DESCRIPTORS } from './descriptors';

/** Reads a generated props JSON if present (it is produced by `generate:props`). */
function readProps(name: string): PropsRecord[] | null {
  const file = resolve(process.cwd(), '.generated/props', `${name}.json`);
  if (!existsSync(file)) return null;
  return (JSON.parse(readFileSync(file, 'utf8')) as { props: PropsRecord[] }).props;
}

const fullPages = COMPONENT_META.filter((meta) => meta.playground === 'full');

describe('playground descriptors', () => {
  it('every full-playground page has a descriptor keyed by its slug', () => {
    for (const meta of fullPages) {
      expect(
        PLAYGROUND_DESCRIPTORS[meta.slug],
        `${meta.slug} is 'full' but has no descriptor`,
      ).toBeDefined();
    }
  });

  it('every descriptor is keyed by a full-playground slug', () => {
    const fullSlugs = new Set(fullPages.map((meta) => meta.slug));
    for (const slug of Object.keys(PLAYGROUND_DESCRIPTORS)) {
      expect(fullSlugs.has(slug), `descriptor "${slug}" has no 'full' catalog page`).toBe(true);
    }
  });

  it('every surfaced enum control resolves a non-empty option list', () => {
    for (const meta of fullPages) {
      const descriptor = PLAYGROUND_DESCRIPTORS[meta.slug];
      if (!descriptor) continue;
      const props = readProps(meta.propsComponents[0]!);
      if (!props) continue; // JSON not generated in this run; covered by build.
      const controls = inferControls(props, descriptor.surfacedProps, descriptor.enumOptions);
      for (const control of controls) {
        if (control.kind === 'enum') {
          expect(
            control.options?.length ?? 0,
            `${meta.slug}.${control.name} is an enum with no options`,
          ).toBeGreaterThan(0);
        }
      }
    }
  });
});
