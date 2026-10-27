import {
  color,
  corner,
  defineComponentTokens,
  elevation,
  px,
  type ComponentToken,
  type TokenPaints,
  type TokenValue,
} from '../../tokens/component';

/*
 * Button's component tokens, M3 Expressive's `md.comp.button.<variant>.*` and
 * `md.comp.button.<size>.*` names (checked against m3.material.io's token tables,
 * 2026-10-14), with Compose's defaults. `button-styles.ts` reads one private variable per
 * part; the root's `data-variant` and `data-size` pick the public names and defaults. The
 * split button's halves read the same colours (`buttonVariantClasses`), so a variant's
 * tokens restyle them too.
 *
 * A toggle's unselected colours default to M3's own values. Where M3 has no unselected
 * token for a variant (the elevated and outlined label, the outlined container), the
 * unselected part follows the resting one. Hover, focus, pressed and disabled values, the
 * pressed shape, outline widths and sizes stay classes.
 */

const container: TokenPaints = { property: 'background-color' };
const label: TokenPaints = { property: 'color' };
const selectedContainer: TokenPaints = { property: 'background-color', state: 'selected' };
const selectedLabel: TokenPaints = { property: 'color', state: 'selected' };
// An unselected toggle has no attribute of its own, so the probe story marks its instance.
const unselectedContainer: TokenPaints = { property: 'background-color', state: 'unselected' };
const unselectedLabel: TokenPaints = { property: 'color', state: 'unselected' };
const roundShape: TokenPaints = { property: 'border-top-left-radius' };
// A selected round toggle takes the square shape, so that's where the square token shows.
const squareShape: TokenPaints = { property: 'border-top-left-radius', state: 'selected' };

/** The private parts every variant without its own token takes from its resting colours. */
const followsResting = {
  'unselected-label-text-color': 'var(--_md-comp-button-label-text-color)',
} as const;

/** The six colour tokens of a variant with a full toggle set. */
function toggleColors(
  compose: string,
  colors: {
    container: TokenValue;
    label: TokenValue;
    selectedContainer: TokenValue;
    selectedLabel: TokenValue;
    unselectedContainer: TokenValue;
    unselectedLabel: TokenValue;
  },
) {
  return {
    'container-color': {
      value: colors.container,
      description: 'The container.',
      compose: `${compose}.ContainerColor`,
      paints: container,
    },
    'label-text-color': {
      value: colors.label,
      description: 'The label and icon.',
      compose: `${compose}.LabelTextColor`,
      paints: label,
    },
    'selected-container-color': {
      value: colors.selectedContainer,
      description: 'The container of a selected toggle.',
      compose: `${compose}.SelectedContainerColor`,
      paints: selectedContainer,
    },
    'selected-label-text-color': {
      value: colors.selectedLabel,
      description: 'The label and icon of a selected toggle.',
      compose: `${compose}.SelectedLabelTextColor`,
      paints: selectedLabel,
    },
    'unselected-container-color': {
      value: colors.unselectedContainer,
      description: 'The container of an unselected toggle.',
      compose: `${compose}.UnselectedContainerColor`,
      paints: unselectedContainer,
    },
    'unselected-label-text-color': {
      value: colors.unselectedLabel,
      description: 'The label and icon of an unselected toggle.',
      compose: `${compose}.UnselectedLabelTextColor`,
      paints: unselectedLabel,
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
 * The tokens of {@link Button}: `--md-comp-button-<variant>-<part>` per variant and
 * `--md-comp-button-<size>-container-shape-<round|square>` per size.
 */
export const buttonTokenSet = defineComponentTokens({
  name: 'md-comp-button',
  tokens: {},
  scopes: {
    variant: {
      filled: {
        prefix: 'md-comp-button-filled',
        tokens: toggleColors('FilledButtonTokens', {
          container: color('primary'),
          label: color('on-primary'),
          selectedContainer: color('primary'),
          selectedLabel: color('on-primary'),
          unselectedContainer: color('surface-container'),
          unselectedLabel: color('on-surface-variant'),
        }),
        fixed: { 'container-elevation': elevation(0), 'outline-color': 'transparent' },
      },
      elevated: {
        prefix: 'md-comp-button-elevated',
        tokens: {
          'container-color': {
            value: color('surface-container-low'),
            description: 'The container.',
            compose: 'ElevatedButtonTokens.ContainerColor',
            paints: container,
          },
          'label-text-color': {
            value: color('primary'),
            description: 'The label and icon, and an unselected toggle’s.',
            compose: 'ElevatedButtonTokens.LabelTextColor',
            paints: label,
          },
          'container-elevation': {
            value: elevation(1),
            description: 'The shadow at rest.',
            compose: 'ElevatedButtonTokens.ContainerElevation',
            paints: { property: 'box-shadow' },
          },
          'selected-container-color': {
            value: color('primary'),
            description: 'The container of a selected toggle.',
            compose: 'ElevatedButtonTokens.SelectedContainerColor',
            paints: selectedContainer,
          },
          'selected-label-text-color': {
            value: color('on-primary'),
            description: 'The label and icon of a selected toggle.',
            compose: 'ElevatedButtonTokens.SelectedLabelTextColor',
            paints: selectedLabel,
          },
          'unselected-container-color': {
            value: color('surface-container-low'),
            description: 'The container of an unselected toggle.',
            compose: 'ElevatedButtonTokens.UnselectedContainerColor',
            paints: unselectedContainer,
          },
        },
        fixed: { ...followsResting, 'outline-color': 'transparent' },
      },
      tonal: {
        prefix: 'md-comp-button-tonal',
        tokens: toggleColors('TonalButtonTokens', {
          container: color('secondary-container'),
          label: color('on-secondary-container'),
          selectedContainer: color('secondary'),
          selectedLabel: color('on-secondary'),
          unselectedContainer: color('secondary-container'),
          unselectedLabel: color('on-secondary-container'),
        }),
        fixed: { 'container-elevation': elevation(0), 'outline-color': 'transparent' },
      },
      outlined: {
        prefix: 'md-comp-button-outlined',
        tokens: {
          'outline-color': {
            value: color('outline-variant'),
            description: 'The outline.',
            compose: 'OutlinedButtonTokens.OutlineColor',
            paints: { property: 'border-top-color' },
          },
          'label-text-color': {
            value: color('on-surface-variant'),
            description: 'The label and icon, and an unselected toggle’s.',
            compose: 'OutlinedButtonTokens.LabelTextColor',
            paints: label,
          },
          'selected-container-color': {
            value: color('inverse-surface'),
            description: 'The container of a selected toggle, which has no outline.',
            compose: 'OutlinedButtonTokens.SelectedContainerColor',
            paints: selectedContainer,
          },
          'selected-label-text-color': {
            value: color('inverse-on-surface'),
            description: 'The label and icon of a selected toggle.',
            compose: 'OutlinedButtonTokens.SelectedLabelTextColor',
            paints: selectedLabel,
          },
        },
        fixed: {
          ...followsResting,
          'container-color': 'transparent',
          'container-elevation': elevation(0),
          'unselected-container-color': 'transparent',
        },
      },
      text: {
        prefix: 'md-comp-button-text',
        tokens: {
          'label-text-color': {
            value: color('primary'),
            description: 'The label and icon.',
            compose: 'TextButtonTokens.LabelTextColor',
            paints: label,
          },
        },
        // Text buttons have no toggle form; the toggle parts only complete the scope.
        fixed: {
          ...followsResting,
          'container-color': 'transparent',
          'container-elevation': elevation(0),
          'outline-color': 'transparent',
          'selected-container-color': 'transparent',
          'selected-label-text-color': 'var(--_md-comp-button-label-text-color)',
          'unselected-container-color': 'transparent',
        },
      },
    },
    size: {
      xs: {
        prefix: 'md-comp-button-xsmall',
        tokens: shapes('ButtonXSmallTokens', corner('medium')),
        fixed: { 'half-height': px(16) },
      },
      sm: {
        prefix: 'md-comp-button-small',
        tokens: shapes('ButtonSmallTokens', corner('medium')),
        fixed: { 'half-height': px(20) },
      },
      md: {
        prefix: 'md-comp-button-medium',
        tokens: shapes('ButtonMediumTokens', corner('large')),
        fixed: { 'half-height': px(28) },
      },
      lg: {
        prefix: 'md-comp-button-large',
        tokens: shapes('ButtonLargeTokens', corner('extra-large')),
        fixed: { 'half-height': px(48) },
      },
      xl: {
        prefix: 'md-comp-button-xlarge',
        tokens: shapes('ButtonXLargeTokens', corner('extra-large')),
        fixed: { 'half-height': px(68) },
      },
    },
  },
  derived: {
    // Full corners stop at half the height, so the press morph interpolates smoothly.
    'container-shape-round-capped':
      'min(var(--_md-comp-button-container-shape-round), var(--_md-comp-button-half-height))',
  },
});
