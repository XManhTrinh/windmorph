import {
  RAIL_GROUPS,
  pagesInRailGroup,
  type ComponentMeta,
  type RailGroup,
} from '../content/components/catalog';

/** The components index, filtered to Windmorph Pro (`components/component-index.tsx`). */
export const PRO_COMPONENTS_HREF = '/components?filter=pro';

/** A Pro summary without the "Not an M3 component (…)." note the index shows after it. */
export function proSummary(summary: string): string {
  return summary.replace(/\s*Not an M3 component \([^)]*\)\.$/, '');
}

/** Windmorph Pro's components by category, in the navigation's order, from the catalog. */
export function proPagesByGroup(): { group: RailGroup; pages: ComponentMeta[] }[] {
  return RAIL_GROUPS.map((group) => ({
    group,
    pages: pagesInRailGroup(group.id).filter((page) => page.pro),
  })).filter(({ pages }) => pages.length > 0);
}
