import { tv, type VariantProps } from '../../utils/tv';
import { connectedShapeVariants } from '../button/connected-shapes';

/*
 * Values follow the M3 Expressive icon button specs and Compose's *IconButtonTokens files.
 * Width = icon size + leading + trailing space; Compose's "Uniform" width option is the
 * default width. Every class is written out in full so Tailwind can find it.
 *
 * Colours (2026-10-13, from the spec's colour table): standard icons are
 * `on-surface-variant` (`primary` when a toggle is selected), and outlined ones have an
 * `outline-variant` outline around an `on-surface-variant` icon. A container that needs
 * another content colour for its standard and outlined icon buttons (a vibrant toolbar, a
 * snackbar) sets `--md-comp-icon-button-icon-color` on an ancestor, e.g. to `currentColor`
 * to inherit its own text colour.
 *
 * The resting, selected and unselected colours, the outline colour and the resting corners
 * come from the component tokens (`icon-button-tokens.ts`): the root carries
 * `data-tokens="md-comp-icon-button"`, `data-variant` and `data-size`, and the classes read
 * one private variable per part. A consumer class (`bg-tertiary`) still wins in `cn()`.
 *
 * A disabled outlined icon button's outline is `outline-variant` at 10%, the same as a
 * disabled outlined Button (the tokens keep `outline-variant` and give no opacity of their
 * own; Button's is the disabled container opacity). A selected outlined toggle has no
 * outline, disabled or not (2026-10-13).
 */
/*
 * The resting round and square corners come from the component tokens
 * (`icon-button-tokens.ts`, `--md-comp-icon-button-<size>-container-shape-*`); full corners
 * are capped at half the height (the set's derived `container-shape-round-capped`).
 */
const round = 'rounded-[var(--_md-comp-icon-button-container-shape-round-capped)]';
const square = 'rounded-[var(--_md-comp-icon-button-container-shape-square)]';

const pressed = {
  xs: 'data-pressed:rounded-corner-small',
  sm: 'data-pressed:rounded-corner-small',
  md: 'data-pressed:rounded-corner-medium',
  lg: 'data-pressed:rounded-corner-large',
  xl: 'data-pressed:rounded-corner-large',
} as const;

/** Toggle, selected: round becomes square… */
const selectedSquare =
  'data-selected:not-data-pressed:not-data-disabled:rounded-[var(--_md-comp-icon-button-container-shape-square)]';

/** …and square becomes round (Compose `SelectedContainerShapeSquare` = full). */
const selectedRound =
  'data-selected:not-data-pressed:not-data-disabled:rounded-[var(--_md-comp-icon-button-container-shape-round-capped)]';

/** Container widths in px: narrow / default / wide. */
const widths = {
  xs: { narrow: 'w-[28px]', default: 'w-[32px]', wide: 'w-[40px]' },
  sm: { narrow: 'w-[32px]', default: 'w-[40px]', wide: 'w-[52px]' },
  md: { narrow: 'w-[48px]', default: 'w-[56px]', wide: 'w-[72px]' },
  lg: { narrow: 'w-[64px]', default: 'w-[96px]', wide: 'w-[128px]' },
  xl: { narrow: 'w-[104px]', default: 'w-[136px]', wide: 'w-[184px]' },
} as const;

type Size = keyof typeof pressed;
const SIZES = Object.keys(pressed) as Size[];
const WIDTHS = ['narrow', 'default', 'wide'] as const;

const shapeVariants = [
  { connected: 'none' as const, shape: 'round' as const, class: { root: round } },
  { connected: 'none' as const, shape: 'square' as const, class: { root: square } },
  {
    connected: 'none' as const,
    toggle: true,
    shape: 'round' as const,
    class: { root: selectedSquare },
  },
  {
    connected: 'none' as const,
    toggle: true,
    shape: 'square' as const,
    class: { root: selectedRound },
  },
];

const sizeVariants = SIZES.flatMap((size) => [
  { size, connected: 'none' as const, class: { root: pressed[size] } },
  ...WIDTHS.map((width) => ({ size, width, class: { root: widths[size][width] } })),
]);

/** Variant definitions for {@link IconButton}; extend them to add variants. */
export const iconButtonStyles = tv({
  slots: {
    root: [
      'inline-flex shrink-0 cursor-pointer items-center justify-center p-0 align-middle select-none',
      'state-layer focus-ring container-motion',
      'data-disabled:cursor-default',
    ],
    // Library-owned inner wrapper: holds the icon and the touch target.
    content: 'relative inline-flex items-center justify-center',
    icon: 'inline-flex shrink-0 items-center justify-center [&>svg]:size-full',
  },
  variants: {
    variant: {
      standard: {
        root: 'bg-transparent text-[color:var(--_md-comp-icon-button-icon-color)] data-disabled:text-on-surface/38',
      },
      filled: {
        root: 'bg-[var(--_md-comp-icon-button-container-color)] text-[color:var(--_md-comp-icon-button-icon-color)] data-disabled:bg-on-surface/10 data-disabled:text-on-surface/38',
      },
      tonal: {
        root: 'bg-[var(--_md-comp-icon-button-container-color)] text-[color:var(--_md-comp-icon-button-icon-color)] data-disabled:bg-on-surface/10 data-disabled:text-on-surface/38',
      },
      outlined: {
        root: 'border border-solid border-[color:var(--_md-comp-icon-button-outline-color)] bg-transparent text-[color:var(--_md-comp-icon-button-icon-color)] data-disabled:not-data-selected:border-outline-variant/10 data-disabled:text-on-surface/38',
      },
    },
    size: {
      xs: { root: 'h-[32px]', icon: 'size-[20px]' },
      sm: { root: 'h-[40px]', icon: 'size-[24px]' },
      md: { root: 'h-[56px]', icon: 'size-[24px]' },
      lg: { root: 'h-[96px]', icon: 'size-[32px]' },
      xl: { root: 'h-[136px]', icon: 'size-[40px]' },
    },
    width: { narrow: {}, default: {}, wide: {} },
    shape: { round: {}, square: {} },
    toggle: { true: {}, false: {} },
    /** Position in a connected button group, set by `ButtonGroup`. */
    connected: { none: {}, leading: {}, middle: {}, trailing: {} },
    /** The colour scheme of an enclosing toolbar, set from its context. */
    toolbar: { none: {}, standard: {}, vibrant: {} },
  },
  compoundVariants: [
    ...shapeVariants,
    ...sizeVariants,
    ...connectedShapeVariants,
    // Extra small and small connected groups keep 48px wide buttons (button group specs).
    {
      size: ['xs', 'sm'],
      connected: ['leading', 'middle', 'trailing'],
      class: { root: 'min-w-[48px]' },
    },
    { variant: 'outlined', size: 'lg', class: { root: 'border-2' } },
    { variant: 'outlined', size: 'xl', class: { root: 'border-3' } },
    // Toggle colours: unselected → selected, from the component tokens.
    {
      toggle: true,
      class: {
        root: 'bg-[var(--_md-comp-icon-button-unselected-container-color)] text-[color:var(--_md-comp-icon-button-unselected-icon-color)] data-selected:not-data-disabled:bg-[var(--_md-comp-icon-button-selected-container-color)] data-selected:not-data-disabled:text-[color:var(--_md-comp-icon-button-selected-icon-color)]',
      },
    },
    {
      variant: 'outlined',
      toggle: true,
      class: {
        root: 'data-disabled:data-selected:bg-on-surface/10 data-selected:border-transparent',
      },
    },
    // In a vibrant toolbar (M3 toolbar colour spec, FloatingToolbarTokens.VibrantButton*),
    // selected tonal toggles turn surface-container / on-surface. Standard icons take the
    // toolbar's on-primary-container through --md-comp-icon-button-icon-color.
    {
      variant: 'tonal',
      toggle: true,
      toolbar: 'vibrant',
      class: {
        root: 'data-selected:not-data-disabled:bg-surface-container data-selected:not-data-disabled:text-on-surface',
      },
    },
  ],
  defaultVariants: {
    variant: 'filled',
    size: 'sm',
    width: 'default',
    shape: 'round',
    toggle: false,
    connected: 'none',
    toolbar: 'none',
  },
});

export type IconButtonStyleProps = VariantProps<typeof iconButtonStyles>;
export type IconButtonVariant = NonNullable<IconButtonStyleProps['variant']>;
export type IconButtonWidth = NonNullable<IconButtonStyleProps['width']>;
