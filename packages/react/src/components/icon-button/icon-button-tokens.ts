import {
  color,
  corner,
  defineComponentTokens,
  px,
  type ComponentToken,
  type TokenPaints,
  type TokenValue,
} from '../../tokens/component';

/*
 * IconButton's component tokens, M3 Expressive's `md.comp.icon-button.<variant>.*` and
 * `md.comp.icon-button.<size>.*` names (checked against m3.material.io's token tables,
 * 2026-10-14), with Compose's defaults. `icon-button-styles.ts` reads one private variable
 * per part; the root's `data-variant` and `data-size` pick the public names and defaults.
 *
 * The standard and outlined icon colours fall back to `--md-comp-icon-button-icon-color`
 * (M3's baseline `md.comp.icon-button.icon.color`), the existing contract that app bars,
 * search bars and vibrant toolbars set to `currentColor` and dialogs' close buttons set to
 * `on-surface`. A toggle's unselected colours default to M3's own values; where M3 has no
 * unselected token for a variant (standard and outlined), the unselected part follows the
 * resting one. Hover, focus, pressed and disabled values, the pressed shape, outline widths,
 * widths and sizes stay classes.
 */

const container: TokenPaints = { property: 'background-color' };
const icon: TokenPaints = { property: 'color' };
const selectedContainer: TokenPaints = { property: 'background-color', state: 'selected' };
const selectedIcon: TokenPaints = { property: 'color', state: 'selected' };
// An unselected toggle has no attribute of its own, so the probe story marks its instance.
const unselectedContainer: TokenPaints = { property: 'background-color', state: 'unselected' };
const unselectedIcon: TokenPaints = { property: 'color', state: 'unselected' };
const roundShape: TokenPaints = { property: 'border-top-left-radius' };
// A selected round toggle takes the square shape, so that's where the square token shows.
const squareShape: TokenPaints = { property: 'border-top-left-radius', state: 'selected' };

/** The standard and outlined icon colour: the existing contract, then `on-surface-variant`. */
const contractIconColor = `var(--md-comp-icon-button-icon-color, ${color('on-surface-variant')})`;

/** The private parts a variant without its own token takes from its resting colours. */
const followsResting = {
  'unselected-container-color': 'transparent',
  'unselected-icon-color': 'var(--_md-comp-icon-button-icon-color)',
} as const;

/** The six colour tokens of a variant with a container and a full toggle set. */
function toggleColors(
  compose: string,
  colors: {
    container: TokenValue;
    icon: TokenValue;
    selectedContainer: TokenValue;
    selectedIcon: TokenValue;
    unselectedContainer: TokenValue;
    unselectedIcon: TokenValue;
  },
) {
  return {
    'container-color': {
      value: colors.container,
      description: 'The container.',
      compose: `${compose}.ContainerColor`,
      paints: container,
    },
    'icon-color': {
      value: colors.icon,
      description: 'The icon.',
      compose: `${compose}.Color`,
      paints: icon,
    },
    'selected-container-color': {
      value: colors.selectedContainer,
      description: 'The container of a selected toggle.',
      compose: `${compose}.SelectedContainerColor`,
      paints: selectedContainer,
    },
    'selected-icon-color': {
      value: colors.selectedIcon,
      description: 'The icon of a selected toggle.',
      compose: `${compose}.ToggleSelectedColor`,
      paints: selectedIcon,
    },
    'unselected-container-color': {
      value: colors.unselectedContainer,
      description: 'The container of an unselected toggle.',
      compose: `${compose}.UnselectedContainerColor`,
      paints: unselectedContainer,
    },
    'unselected-icon-color': {
      value: colors.unselectedIcon,
      description: 'The icon of an unselected toggle.',
      compose: `${compose}.ToggleUnselectedColor`,
      paints: unselectedIcon,
    },
  } satisfies Record<string, ComponentToken>;
}

/** A size's round and square corners; round is full, capped at half the height. */
function shapes(compose: string, square: TokenValue) {
  return {
    'container-shape-round': {
      value: corner('full'),
      description: 'The round shape: full corners, at most half the height.',
      compose: `${compose}.ContainerShapeRound`,
      paints: roundShape,
    },
    'container-shape-square': {
      value: square,
      description: 'The square shape, which a selected round toggle also takes.',
      compose: `${compose}.ContainerShapeSquare`,
      paints: squareShape,
    },
  } satisfies Record<string, ComponentToken>;
}

/**
 * The tokens of {@link IconButton}: `--md-comp-icon-button-<variant>-<part>` per variant
 * and `--md-comp-icon-button-<size>-container-shape-<round|square>` per size. The standard
 * and outlined icon colours fall back to `--md-comp-icon-button-icon-color`.
 */
export const iconButtonTokenSet = defineComponentTokens({
  name: 'md-comp-icon-button',
  tokens: {},
  scopes: {
    variant: {
      standard: {
        prefix: 'md-comp-icon-button-standard',
        tokens: {
          'icon-color': {
            value: contractIconColor,
            description:
              'The icon, and an unselected toggle’s. Falls back to `--md-comp-icon-button-icon-color`.',
            compose: 'StandardIconButtonTokens.Color',
            paints: icon,
          },
          'selected-icon-color': {
            value: color('primary'),
            description: 'The icon of a selected toggle.',
            compose: 'StandardIconButtonTokens.SelectedColor',
            paints: selectedIcon,
          },
        },
        fixed: {
          ...followsResting,
          'container-color': 'transparent',
          'outline-color': 'transparent',
          'selected-container-color': 'transparent',
        },
      },
      filled: {
        prefix: 'md-comp-icon-button-filled',
        tokens: toggleColors('FilledIconButtonTokens', {
          container: color('primary'),
          icon: color('on-primary'),
          selectedContainer: color('primary'),
          selectedIcon: color('on-primary'),
          unselectedContainer: color('surface-container'),
          unselectedIcon: color('on-surface-variant'),
        }),
        fixed: { 'outline-color': 'transparent' },
      },
      tonal: {
        prefix: 'md-comp-icon-button-tonal',
        tokens: toggleColors('FilledTonalIconButtonTokens', {
          container: color('secondary-container'),
          icon: color('on-secondary-container'),
          selectedContainer: color('secondary'),
          selectedIcon: color('on-secondary'),
          unselectedContainer: color('secondary-container'),
          unselectedIcon: color('on-secondary-container'),
        }),
        fixed: { 'outline-color': 'transparent' },
      },
      outlined: {
        prefix: 'md-comp-icon-button-outlined',
        tokens: {
          'outline-color': {
            value: color('outline-variant'),
            description: 'The outline.',
            compose: 'OutlinedIconButtonTokens.OutlineColor',
            paints: { property: 'border-top-color' },
          },
          'icon-color': {
            value: contractIconColor,
            description:
              'The icon, and an unselected toggle’s. Falls back to `--md-comp-icon-button-icon-color`.',
            compose: 'OutlinedIconButtonTokens.Color',
            paints: icon,
          },
          'selected-container-color': {
            value: color('inverse-surface'),
            description: 'The container of a selected toggle, which has no outline.',
            compose: 'OutlinedIconButtonTokens.SelectedContainerColor',
            paints: selectedContainer,
          },
          'selected-icon-color': {
            value: color('inverse-on-surface'),
            description: 'The icon of a selected toggle.',
            compose: 'OutlinedIconButtonTokens.SelectedColor',
            paints: selectedIcon,
          },
        },
        fixed: { ...followsResting, 'container-color': 'transparent' },
      },
    },
    size: {
      xs: {
        prefix: 'md-comp-icon-button-xsmall',
        tokens: shapes('XSmallIconButtonTokens', corner('medium')),
        fixed: { 'half-height': px(16) },
      },
      sm: {
        prefix: 'md-comp-icon-button-small',
        tokens: shapes('SmallIconButtonTokens', corner('medium')),
        fixed: { 'half-height': px(20) },
      },
      md: {
        prefix: 'md-comp-icon-button-medium',
        tokens: shapes('MediumIconButtonTokens', corner('large')),
        fixed: { 'half-height': px(28) },
      },
      lg: {
        prefix: 'md-comp-icon-button-large',
        tokens: shapes('LargeIconButtonTokens', corner('extra-large')),
        fixed: { 'half-height': px(48) },
      },
      xl: {
        prefix: 'md-comp-icon-button-xlarge',
        tokens: shapes('XLargeIconButtonTokens', corner('extra-large')),
        fixed: { 'half-height': px(68) },
      },
    },
  },
  derived: {
    // Full corners stop at half the height, so the press morph interpolates smoothly.
    'container-shape-round-capped':
      'min(var(--_md-comp-icon-button-container-shape-round), var(--_md-comp-icon-button-half-height))',
  },
});
