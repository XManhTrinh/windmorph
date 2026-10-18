import { color, defineComponentTokens } from '../../tokens/component';

/*
 * The list's component tokens, M3's `md.comp.list.list-item.*` names (checked against
 * m3.material.io's token tables, 2026-10-14), with the defaults of `list-styles.ts`.
 *
 * The list's root and each item carry `data-tokens="md-comp-list"` and `data-variant`, so an
 * item's own state (`data-selected`) picks its colours. A standard item is see-through by
 * default (it takes its container's colour: a sheet, a card); a segmented item is `surface`.
 * Selected content, hover, focus, press, disabled and the item shapes stay classes.
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
