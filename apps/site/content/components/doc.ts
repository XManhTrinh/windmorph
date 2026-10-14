import type { ComponentTokenSet } from '@windmorph/react';
import type { ReactNode } from 'react';

/** The tabs of a component page, in display order; `overview` is the page's own URL. */
export const COMPONENT_TABS = ['overview', 'api', 'accessibility', 'guidelines'] as const;

export type ComponentTab = (typeof COMPONENT_TABS)[number];

/** The tabs with a URL segment of their own (`/components/<slug>/<tab>`). */
export const SUB_TABS = COMPONENT_TABS.filter(
  (tab): tab is Exclude<ComponentTab, 'overview'> => tab !== 'overview',
);

/** Tab labels, as the tabs and the search show them. */
export const TAB_LABELS: Record<ComponentTab, string> = {
  overview: 'Overview',
  api: 'API',
  accessibility: 'Accessibility',
  guidelines: 'Guidelines',
};

/** The URL of a component page's tab. */
export function componentTabHref(slug: string, tab: ComponentTab = 'overview'): string {
  return tab === 'overview' ? `/components/${slug}` : `/components/${slug}/${tab}`;
}

/**
 * A component page's written content, split by tab. Each part is a run of `<section>`s with
 * an `id`'d `h2`, which the "On this page" outline lists. The page template adds the
 * playground (Overview), the props tables (API) and the purpose links (Guidelines).
 */
export interface ComponentDoc {
  /** Live examples. */
  overview?: ReactNode;
  /** Purpose, when to use it, and how it behaves. */
  guidelines?: ReactNode;
  /** Keyboard keys, roles and what assistive tech announces. */
  accessibility?: ReactNode;
  /** Theming, tokens, spec values and differences from Compose, below the props tables. */
  api?: ReactNode;
  /**
   * The component's M3 token sets (`cardTokenSet`), rendered as the API tab's generated
   * Tokens section. Each set the core exports is listed on exactly one page.
   */
  tokens?: readonly ComponentTokenSet[];
}
