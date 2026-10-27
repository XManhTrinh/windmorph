import {
  corner,
  defineComponentTokens,
  px,
  type ComponentTokenScope,
  type TokenPaints,
} from '../../tokens/component';

/*
 * The split button's component tokens, M3 Expressive's `md.comp.split-button.<size>.*`
 * names (checked against m3.material.io's token tables, 2026-10-14), with Compose's
 * defaults: the outer corners of its two halves, per size. The root carries
 * `data-tokens="md-comp-split-button"`, `data-variant` and `data-size`; the halves inherit
 * the resolved corner. Their colours are Button's (`md-comp-button`): each half carries
 * `data-tokens="md-comp-button"` and the variant, so `--md-comp-button-filled-*` restyles
 * them too. The inner corners and their state changes stay classes.
 */

// The leading half's outer corner (its start side), in LTR.
const outerCorner: TokenPaints = { property: 'border-top-left-radius', slot: 'leading' };

/** One size's outer corners: full, capped at half the height of the halves. */
function size(prefix: string, compose: string, halfHeight: number): ComponentTokenScope {
  return {
    prefix,
    tokens: {
      'container-shape': {
        value: corner('full'),
        description: 'The outer corners of both halves: full, at most half the height.',
        compose: `${compose}.ContainerShape`,
        paints: outerCorner,
      },
    },
    fixed: { 'half-height': px(halfHeight) },
  };
}

/** The tokens of {@link SplitButton}: `--md-comp-split-button-<size>-container-shape`. */
export const splitButtonTokenSet = defineComponentTokens({
  name: 'md-comp-split-button',
  tokens: {},
  scopes: {
    size: {
      xs: size('md-comp-split-button-xsmall', 'SplitButtonXSmallTokens', 16),
      sm: size('md-comp-split-button-small', 'SplitButtonSmallTokens', 20),
      md: size('md-comp-split-button-medium', 'SplitButtonMediumTokens', 28),
      lg: size('md-comp-split-button-large', 'SplitButtonLargeTokens', 48),
      xl: size('md-comp-split-button-xlarge', 'SplitButtonXLargeTokens', 68),
    },
  },
  derived: {
    // Full corners stop at half the height, so the corner transitions interpolate smoothly.
    'container-shape-capped':
      'min(var(--_md-comp-split-button-container-shape), var(--_md-comp-split-button-half-height))',
  },
});
