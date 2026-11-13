import { describe, expect, it } from 'vitest';
import { COMPONENT_META } from '../content/components/catalog';
import { COMPONENT_PREVIEWS } from './component-previews';

describe('the component index sketches', () => {
  // A page added to the catalog without a sketch shows an empty box on its card: twelve pages
  // had gone that way before this test (2026-11-13).
  it('draw every page in the catalog, and no page that is gone', () => {
    const slugs = COMPONENT_META.map((meta) => meta.slug);
    expect(slugs.filter((slug) => !(slug in COMPONENT_PREVIEWS))).toEqual([]);
    expect(Object.keys(COMPONENT_PREVIEWS).filter((slug) => !slugs.includes(slug))).toEqual([]);
  });
});
