import { color, defineComponentTokens } from '../../tokens/component';

/*
 * The list's component tokens, M3's `md.comp.list.list-item.*` names (checked against
 * m3.material.io's token tables, 2026-10-14), with the defaults of `list-styles.ts`.
 *
 * The list's root and each item carry `data-tokens="md-comp-list"` and `data-variant`, so an
 * item's own state (`data-selected`) picks its colours. A standard item is see-through by
 * default (it takes its container's colour: a sheet, a card); a segmented item is `surface`.
 * Hover, focus, press, disabled and the item shapes stay classes.
 */

/** The tokens of {@link List}: `--md-comp-list-list-item-<part>`. */
export const listTokenSet = defineComponentTokens({
  name: 'md-comp-list',
  tokens: {
    'list-item-label-text-color': {
      value: color('on-surface'),
      description: 'The headline.',
      compose: 'ListTokens.ItemLabelTextColor',
      paints: { property: 'color', slot: 'headline' },
    },
    'list-item-supporting-text-color': {
      value: color('on-surface-variant'),
      description: 'The supporting text.',
      compose: 'ListTokens.ItemSupportingTextColor',
      paints: { property: 'color', slot: 'supporting' },
    },
    'list-item-overline-color': {
      value: color('on-surface-variant'),
      description: 'The overline.',
      compose: 'ListTokens.ItemOverlineColor',
      paints: { property: 'color', slot: 'overline' },
    },
    'list-item-leading-icon-color': {
      value: color('on-surface-variant'),
      description: 'The leading content: an icon, or text.',
      compose: 'ListTokens.ItemLeadingIconColor',
      paints: { property: 'color', slot: 'leading' },
    },
    'list-item-trailing-icon-color': {
      value: color('on-surface-variant'),
      description: 'The trailing content: an icon, or supporting text.',
      compose: 'ListTokens.ItemTrailingIconColor',
      paints: { property: 'color', slot: 'trailing' },
    },
    'list-item-selected-container-color': {
      value: color('secondary-container'),
      description: 'A selected item.',
      compose: 'ListTokens.ItemSelectedContainerColor',
      paints: { property: 'background-color', state: 'selected' },
    },
    'list-item-selected-label-text-color': {
      value: color('on-secondary-container'),
      description: "A selected item's headline.",
      compose: 'ListTokens.ItemSelectedLabelTextColor',
      paints: { property: 'color', slot: 'headline', state: 'selected' },
    },
    'list-item-selected-supporting-text-color': {
      value: color('on-secondary-container'),
      description: "A selected item's supporting text.",
      compose: 'ListTokens.ItemSelectedSupportingTextColor',
      paints: { property: 'color', slot: 'supporting', state: 'selected' },
    },
    'list-item-selected-overline-color': {
      value: color('on-secondary-container'),
      description: "A selected item's overline.",
      compose: 'ListTokens.ItemSelectedOverlineColor',
      paints: { property: 'color', slot: 'overline', state: 'selected' },
    },
    'list-item-selected-leading-icon-color': {
      value: color('on-secondary-container'),
      description: "A selected item's leading content.",
      compose: 'ListTokens.ItemSelectedLeadingIconColor',
      paints: { property: 'color', slot: 'leading', state: 'selected' },
    },
    'list-item-selected-trailing-icon-color': {
      value: color('on-secondary-container'),
      description: "A selected item's trailing content and its check.",
      compose: 'ListTokens.ItemSelectedTrailingIconColor',
      paints: { property: 'color', slot: 'trailing', state: 'selected' },
    },
  },
  scopes: {
    variant: {
      standard: {
        prefix: 'md-comp-list-list-item',
        tokens: {
          'container-color': {
            value: 'transparent',
            description: "An item in a standard list: see-through, on its container's colour.",
            compose: 'ListTokens.ItemContainerColor',
            paints: { property: 'background-color', slot: 'item' },
          },
        },
      },
      segmented: {
        prefix: 'md-comp-list-list-item-segmented',
        tokens: {
          'container-color': {
            value: color('surface'),
            description: 'An item in a segmented list.',
            compose: 'ListTokens.ItemSegmentedContainerColor',
            paints: { property: 'background-color', slot: 'item' },
          },
        },
      },
    },
  },
});
