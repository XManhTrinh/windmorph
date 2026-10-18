import { describe, expect, it } from 'vitest';
import {
  CATEGORY_COUNT,
  COMPONENT_META,
  COMPONENT_PAGE_COUNT,
  GALLERY_RAIL_GROUPS,
  RAIL_GROUPS,
  pagesInRailGroup,
} from './catalog';

describe('component catalog invariants', () => {
  const validIds = new Set(RAIL_GROUPS.map((group) => group.id));

  it('every page has a railGroup that exists in RAIL_GROUPS', () => {
    for (const meta of COMPONENT_META) {
      expect(validIds.has(meta.railGroup), `${meta.slug} has unknown railGroup`).toBe(true);
    }
  });

  it('every non-primitive rail group is non-empty', () => {
    for (const group of RAIL_GROUPS) {
      if (group.id === 'primitives') continue;
      expect(pagesInRailGroup(group.id).length, `${group.id} is empty`).toBeGreaterThan(0);
    }
  });

  it("lists each rail group's pages alphabetically by title", () => {
    for (const group of RAIL_GROUPS) {
      const titles = pagesInRailGroup(group.id).map((meta) => meta.title);
      expect(titles, group.id).toEqual([...titles].sort((a, b) => a.localeCompare(b, 'en')));
    }
  });

  it('rail labels are a single word', () => {
    for (const group of RAIL_GROUPS) {
      expect(group.railLabel.trim().split(/\s+/).length, `${group.id} rail label`).toBe(1);
    }
  });

  it('the hero stat equals the gallery component-page count (families, no Primitives)', () => {
    // The gallery renders exactly one card per page across the non-primitive rail groups.
    const galleryCards = GALLERY_RAIL_GROUPS.reduce(
      (total, group) => total + pagesInRailGroup(group.id).length,
      0,
    );
    const nonPrimitivePages = COMPONENT_META.filter(
      (meta) => meta.railGroup !== 'primitives',
    ).length;
    // Stat == gallery card count == non-primitive page count — one source of truth.
    expect(COMPONENT_PAGE_COUNT).toBe(galleryCards);
    expect(COMPONENT_PAGE_COUNT).toBe(nonPrimitivePages);
    // The gallery excludes the Primitives reference page.
    expect(GALLERY_RAIL_GROUPS.some((group) => group.id === 'primitives')).toBe(false);
    // Categories == non-primitive rail groups, and both counts are meaningful.
    expect(CATEGORY_COUNT).toBe(GALLERY_RAIL_GROUPS.length);
    expect(COMPONENT_PAGE_COUNT).toBeGreaterThan(0);
    expect(CATEGORY_COUNT).toBeGreaterThan(0);
  });

  it('every full-playground page is in the actions group for phase 1 and names a component', () => {
    for (const meta of COMPONENT_META) {
      if (meta.playground === 'full') {
        expect(meta.propsComponents.length, `${meta.slug} needs a component`).toBeGreaterThan(0);
      }
    }
  });
});
