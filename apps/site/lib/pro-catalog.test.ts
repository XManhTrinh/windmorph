import { describe, expect, it } from 'vitest';
import { COMPONENT_META } from '../content/components/catalog';
import { kindFromSearch } from '../components/component-index';
import { PRO_COMPONENTS_HREF, proPagesByGroup, proSummary } from './pro-catalog';

describe('the Pro guide list', () => {
  it('lists every Pro component once, and nothing else', () => {
    const listed = proPagesByGroup().flatMap(({ pages }) => pages.map((page) => page.slug));
    const pro = COMPONENT_META.filter((meta) => meta.pro).map((meta) => meta.slug);
    expect(listed.length).toBeGreaterThan(0);
    expect([...listed].sort()).toEqual([...pro].sort());
    expect(new Set(listed).size).toBe(listed.length);
  });

  it('drops the "Not an M3 component" note from a summary', () => {
    expect(proSummary('A tag. Not an M3 component (@windmorph/react-pro).')).toBe('A tag.');
    expect(
      proSummary('Rich text. Not an M3 component (@windmorph/react-pro/rich-text, with Tiptap).'),
    ).toBe('Rich text.');
    for (const meta of COMPONENT_META.filter((m) => m.pro)) {
      expect(proSummary(meta.summary)).not.toMatch(/Not an M3/);
    }
  });

  it('links to the components index filtered to Pro', () => {
    expect(kindFromSearch(new URL(PRO_COMPONENTS_HREF, 'https://x.test').search)).toBe('pro');
    expect(kindFromSearch('?filter=expressive')).toBe('expressive');
    expect(kindFromSearch('?filter=nope')).toBe('all');
    expect(kindFromSearch('')).toBe('all');
  });
});
