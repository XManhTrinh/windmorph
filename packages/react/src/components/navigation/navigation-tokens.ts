import { color, corner, defineComponentTokens, type ComponentToken } from '../../tokens/component';

/*
 * The navigation bar's and rail's component tokens, M3 Expressive's `md.comp.nav-bar.*` and
 * `md.comp.nav-rail.*` names (checked against m3.material.io's token tables, 2026-10-14;
 * `navigation-bar` and `navigation-rail` are the baseline sets), with the defaults of
 * `navigation-styles.ts` and `nav-item-styles.ts`.
 *
 * The bar or rail and each of its items carry `data-tokens`, so an item's own state
 * (`data-current`) and layout (`data-layout`) pick its colours: the current label is
 * `secondary` below its icon and `on-secondary-container` beside it, in the pill. Hover,
 * focus, press and disabled colours stay classes.
 */

/** The item tokens, shared by the bar and the rail. */
function itemTokens(
  set: 'NavigationBar' | 'NavigationRail',
): Record<
  | 'item-active-indicator-color'
  | 'item-active-icon-color'
  | 'item-inactive-icon-color'
  | 'item-active-label-text-color'
  | 'item-inactive-label-text-color',
  ComponentToken
> {
  return {
    'item-active-indicator-color': {
      value: color('secondary-container'),
      description: "The current item's pill.",
      compose: `${set}Tokens.ItemActiveIndicatorColor`,
      paints: { property: 'background-color', slot: 'indicator', state: 'current' },
    },
    'item-active-icon-color': {
      value: color('on-secondary-container'),
      description: "The current item's icon.",
      compose: `${set}Tokens.ItemActiveIconColor`,
      paints: { property: 'color', slot: 'icon', state: 'current' },
    },
    'item-inactive-icon-color': {
      value: color('on-surface-variant'),
      description: 'The other items’ icons.',
      compose: `${set}Tokens.ItemInactiveIconColor`,
      paints: { property: 'color', slot: 'icon' },
    },
    'item-active-label-text-color': {
      value: color('secondary'),
      description:
        "The current item's label: `secondary` below its icon, `on-secondary-container` beside it (in the pill).",
      compose: `${set}Tokens.ItemActiveLabelTextColor`,
      paints: { property: 'color', slot: 'label', state: 'current' },
    },
    'item-inactive-label-text-color': {
      value: color('on-surface-variant'),
      description: 'The other items’ labels.',
      compose: `${set}Tokens.ItemInactiveLabelTextColor`,
      paints: { property: 'color', slot: 'label' },
    },
  };
}

/** The tokens of {@link NavigationBar}: `--md-comp-nav-bar-<part>`. */
export const navBarTokenSet = defineComponentTokens({
  name: 'md-comp-nav-bar',
  tokens: {
    'container-color': {
      value: color('surface-container'),
      description: 'The bar.',
      compose: 'NavigationBarTokens.ContainerColor',
      paints: { property: 'background-color' },
    },
    ...itemTokens('NavigationBar'),
  },
  states: {
    layout: { 'bar-start': { 'item-active-label-text-color': color('on-secondary-container') } },
  },
});

/** The tokens of {@link NavigationRail}: `--md-comp-nav-rail-<part>`. */
export const navRailTokenSet = defineComponentTokens({
  name: 'md-comp-nav-rail',
  tokens: {
    'collapsed-container-color': {
      value: color('surface'),
      description: 'The collapsed rail.',
      compose: 'NavigationRailCollapsedTokens.ContainerColor',
      paints: { property: 'background-color' },
    },
    'expanded-container-color': {
      value: color('surface'),
      description: 'The expanded rail, beside the content.',
      compose: 'NavigationRailExpandedTokens.ContainerColor',
      paints: { property: 'background-color', state: 'expanded' },
    },
    'expanded-modal-container-color': {
      value: color('surface-container'),
      description: 'The modal expanded rail, over the content.',
      compose: 'NavigationRailExpandedTokens.ModalContainerColor',
      paints: { property: 'background-color', state: 'modal' },
    },
    'expanded-modal-container-shape': {
      value: corner('large'),
      description: "The modal expanded rail's end corners.",
      compose: 'NavigationRailExpandedTokens.ModalContainerShape',
      paints: { property: 'border-top-right-radius', state: 'modal' },
    },
    ...itemTokens('NavigationRail'),
  },
  states: {
    layout: { 'rail-start': { 'item-active-label-text-color': color('on-secondary-container') } },
  },
});
