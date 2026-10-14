import { corner, defineComponentTokens, px } from '../../tokens/component';

/*
 * The FAB menu's component tokens, M3's `md.comp.fab-menu.*` names (checked against
 * m3.material.io's token tables, 2026-10-14), with Compose's FabMenuBaselineTokens. The
 * root carries `data-tokens="md-comp-fab-menu"`, and the button and the list's items read
 * the private variables it resolves. Colours follow the menu's `color` and elevation its
 * `elevation` prop; sizes stay classes.
 */

/** The tokens of {@link FabMenu}: `--md-comp-fab-menu-*`. */
export const fabMenuTokenSet = defineComponentTokens({
  name: 'md-comp-fab-menu',
  tokens: {
    'close-button-container-shape': {
      // M3's full corners, written as half the 56px close button so the corners interpolate
      // from the FAB's while the button shrinks.
      value: px(28),
      description: 'The open close button’s corners (half its 56px size, so they animate).',
      compose: 'FabMenuBaselineTokens.CloseButtonContainerShape',
      paints: { slot: 'button', property: 'border-top-left-radius', state: 'open' },
    },
    'menu-item-container-shape': {
      value: corner('full'),
      description: 'The corners of the list’s items.',
      compose: 'FabMenuBaselineTokens.ListItemContainerShape',
      paints: { slot: 'item', property: 'border-top-left-radius' },
    },
  },
});
