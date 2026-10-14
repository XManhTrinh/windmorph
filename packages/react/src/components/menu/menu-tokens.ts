import { color, corner, defineComponentTokens, elevation } from '../../tokens/component';

/*
 * The menu's component tokens, M3 Expressive's `md.comp.menus.*` (common) and
 * `md.comp.menus.standard.*` names (checked against m3.material.io's token tables,
 * 2026-10-14; `md.comp.menu.*` is the baseline set), with the defaults of `menu-styles.ts`.
 *
 * The menu, its items, and Select's and Autocomplete's option lists (which share the menu's
 * styles) carry `data-tokens="md-comp-menus"` and `data-variant`, so an item's own state
 * (`data-selected`) picks its colours. The vibrant menu's colours have no public names yet
 * (fixed below). The container shape is the menu's outer corner at rest: the submenu morph's
 * active and inactive corners, hover, focus, press, disabled and the selected item's icon
 * colours stay classes.
 */

/** The tokens of {@link Menu}: `--md-comp-menus-<part>` and `--md-comp-menus-standard-<part>`. */
export const menuTokenSet = defineComponentTokens({
  name: 'md-comp-menus',
  tokens: {
    'container-elevation': {
      value: elevation(2),
      description: "The menu's shadow (each group's, in the gap layout).",
      compose: 'MenuTokens.ContainerElevation',
      paints: { property: 'box-shadow' },
    },
    'container-shape': {
      value: corner('large'),
      description: "The menu's outer corners at rest.",
      compose: 'MenuTokens.ContainerShape',
      paints: { property: 'border-top-left-radius' },
    },
  },
  scopes: {
    variant: {
      standard: {
        prefix: 'md-comp-menus-standard',
        tokens: {
          'container-color': {
            value: color('surface-container-low'),
            description: 'The menu (each group, in the gap layout).',
            compose: 'StandardMenuTokens.ContainerColor',
            paints: { property: 'background-color' },
          },
          'menu-item-label-text-color': {
            value: color('on-surface'),
            description: 'An item’s label.',
            compose: 'StandardMenuTokens.ItemLabelTextColor',
            paints: { property: 'color', slot: 'item' },
          },
          'menu-item-leading-icon-color': {
            value: color('on-surface-variant'),
            description: 'An item’s leading icon.',
            compose: 'StandardMenuTokens.ItemLeadingIconColor',
            paints: { property: 'color', slot: 'leading-icon' },
          },
          'menu-item-trailing-icon-color': {
            value: color('on-surface-variant'),
            description: 'An item’s trailing icon, keyboard shortcut or trailing text.',
            compose: 'StandardMenuTokens.ItemTrailingIconColor',
            paints: { property: 'color', slot: 'trailing-icon' },
          },
          'menu-item-selected-container-color': {
            value: color('tertiary-container'),
            description: 'A selected item.',
            compose: 'StandardMenuTokens.ItemSelectedContainerColor',
            paints: { property: 'background-color', state: 'selected' },
          },
          'menu-item-selected-label-text-color': {
            value: color('on-tertiary-container'),
            description: 'A selected item’s label.',
            compose: 'StandardMenuTokens.ItemSelectedLabelTextColor',
            paints: { property: 'color', state: 'selected' },
          },
        },
      },
      vibrant: {
        prefix: 'md-comp-menus-vibrant',
        fixed: {
          'container-color': color('tertiary-container'),
          'menu-item-label-text-color': color('on-tertiary-container'),
          'menu-item-leading-icon-color': color('on-tertiary-container'),
          'menu-item-trailing-icon-color': color('on-tertiary-container'),
          'menu-item-selected-container-color': color('tertiary'),
          'menu-item-selected-label-text-color': color('on-tertiary'),
        },
      },
    },
  },
});
