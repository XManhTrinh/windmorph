import { color, corner, defineComponentTokens } from '../../tokens/component';

/*
 * The search bar's and search view's component tokens, M3's `md.comp.search-bar.*` and
 * `md.comp.search-view.*` names (checked against m3.material.io's token tables, 2026-10-14),
 * with the defaults of `search-styles.ts`.
 *
 * The bar's tokens are resolved on its pill (`data-tokens="md-comp-search-bar"`), which the
 * expanded views and the searchable Select repeat. In a search app bar the pill takes the
 * app bar's colours (`surface-container`, `surface-container-highest` once content scrolls
 * under it), which stay classes. The view's tokens are resolved on the docked view's
 * dropdown and on the full-screen view (`data-view`), which differ in colour.
 */

/** The tokens of {@link SearchBar}'s field: `--md-comp-search-bar-<part>`. */
export const searchBarTokenSet = defineComponentTokens({
  name: 'md-comp-search-bar',
  tokens: {
    'container-color': {
      value: color('surface-container-high'),
      description: 'The field.',
      compose: 'SearchBarTokens.ContainerColor',
      paints: { property: 'background-color' },
    },
    'container-shape': {
      value: corner('full'),
      description: 'The corners.',
      compose: 'SearchBarTokens.ContainerShape',
      paints: { property: 'border-top-left-radius' },
    },
    'input-text-color': {
      value: color('on-surface'),
      description: 'The query.',
      compose: 'SearchBarTokens.InputTextColor',
      paints: { property: 'color', slot: 'input' },
    },
    'leading-icon-color': {
      value: color('on-surface'),
      description: 'The leading icon.',
      compose: 'SearchBarTokens.LeadingIconColor',
      paints: { property: 'color', slot: 'leading' },
    },
    'trailing-icon-color': {
      value: color('on-surface-variant'),
      description: 'The trailing icons or avatar.',
      compose: 'SearchBarTokens.TrailingIconColor',
      paints: { property: 'color', slot: 'trailing' },
    },
  },
});

/** The tokens of {@link SearchBar}'s expanded view: `--md-comp-search-view-<part>`. */
export const searchViewTokenSet = defineComponentTokens({
  name: 'md-comp-search-view',
  tokens: {
    'container-color': {
      value: color('surface-container-high'),
      description:
        'The view: the docked dropdown (`surface-container-high`) or the full-screen surface (`surface-container-low`).',
      compose: 'SearchViewTokens.ContainerColor',
      paints: { property: 'background-color' },
    },
    'docked-container-shape': {
      value: corner('medium'),
      description: "The docked dropdown's corners.",
      compose: 'SearchViewTokens.DockedContainerShape',
      paints: { property: 'border-top-left-radius' },
    },
  },
  states: {
    view: { 'full-screen': { 'container-color': color('surface-container-low') } },
  },
});
