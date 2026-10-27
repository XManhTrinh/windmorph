import type { ColorRole } from '../../tokens/color';
import {
  color,
  corner,
  defineComponentTokens,
  px,
  type ComponentTokenScope,
} from '../../tokens/component';
import type { FabMenuColor } from './fab-menu-styles';

/*
 * The FAB menu's component tokens, M3's `md.comp.fab-menu.*` names (checked against
 * m3.material.io's token tables, 2026-10-14), with Compose's FabMenuBaselineTokens. The
 * root carries `data-tokens="md-comp-fab-menu"`, and the button and the list's items read
 * the private variables it resolves. Elevation follows the `elevation` prop; sizes stay
 * classes.
 *
 * Colours (2026-10-17; they were classes): the root's `data-color` picks the open close
 * button's set (`md.comp.fab-menu.primary.close-button.*`) and its `data-item-color` the
 * items' (`md.comp.fab-menu.primary-container.list-item.*`), as M3 names them. The closed
 * button is a FAB of the `<color>-container` style and joins the FAB's set
 * (`--md-comp-fab-<color>-container-*`, `fab-tokens.ts`).
 */

const CLOSE_BUTTON: Record<FabMenuColor, { container: ColorRole; icon: ColorRole }> = {
  primary: { container: 'primary', icon: 'on-primary' },
  secondary: { container: 'secondary', icon: 'on-secondary' },
  tertiary: { container: 'tertiary', icon: 'on-tertiary' },
};

const ITEM: Record<FabMenuColor, { container: ColorRole; content: ColorRole }> = {
  primary: { container: 'primary-container', content: 'on-primary-container' },
  secondary: { container: 'secondary-container', content: 'on-secondary-container' },
  tertiary: { container: 'tertiary-container', content: 'on-tertiary-container' },
};

const closeButtonScope = (name: FabMenuColor): ComponentTokenScope => ({
  prefix: `md-comp-fab-menu-${name}`,
  tokens: {
    'close-button-container-color': {
      value: color(CLOSE_BUTTON[name].container),
      description: 'The open close button.',
      paints: { slot: 'button', property: 'background-color', state: 'open' },
    },
    'close-button-icon-color': {
      value: color(CLOSE_BUTTON[name].icon),
      description: 'The open close button’s icon.',
      paints: { slot: 'button', property: 'color', state: 'open' },
    },
  },
});

const itemScope = (name: FabMenuColor): ComponentTokenScope => ({
  prefix: `md-comp-fab-menu-${name}-container`,
  tokens: {
    'list-item-container-color': {
      value: color(ITEM[name].container),
      description: 'The list’s items.',
      paints: { slot: 'item', property: 'background-color' },
    },
    'list-item-label-text-color': {
      value: color(ITEM[name].content),
      description: 'The items’ labels.',
      paints: { slot: 'item', property: 'color' },
    },
    'list-item-icon-color': {
      value: color(ITEM[name].content),
      description: 'The items’ icons.',
      paints: { slot: 'item-icon', property: 'color' },
    },
  },
});

const COLORS: FabMenuColor[] = ['primary', 'secondary', 'tertiary'];

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
  scopes: {
    color: Object.fromEntries(COLORS.map((name) => [name, closeButtonScope(name)])),
    'item-color': Object.fromEntries(COLORS.map((name) => [`${name}-container`, itemScope(name)])),
  },
});
