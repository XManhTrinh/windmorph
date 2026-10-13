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
 * A disabled outlined icon button's outline is `outline-variant` at 10%, the same as a
 * disabled outlined Button (the tokens keep `outline-variant` and give no opacity of their
 * own; Button's is the disabled container opacity). A selected outlined toggle has no
 * outline, disabled or not (2026-10-13).
 */
const full = {
  xs: 'rounded-[min(var(--md-sys-shape-corner-full),16px)]',
  sm: 'rounded-[min(var(--md-sys-shape-corner-full),20px)]',
  md: 'rounded-[min(var(--md-sys-shape-corner-full),28px)]',
  lg: 'rounded-[min(var(--md-sys-shape-corner-full),48px)]',
  xl: 'rounded-[min(var(--md-sys-shape-corner-full),68px)]',
} as const;

const square = {
  xs: 'rounded-corner-medium',
  sm: 'rounded-corner-medium',
  md: 'rounded-corner-large',
  lg: 'rounded-corner-extra-large',
  xl: 'rounded-corner-extra-large',
} as const;

const pressed = {
  xs: 'data-pressed:rounded-corner-small',
  sm: 'data-pressed:rounded-corner-small',
  md: 'data-pressed:rounded-corner-medium',
  lg: 'data-pressed:rounded-corner-large',
  xl: 'data-pressed:rounded-corner-large',
} as const;

/** Toggle, selected: round becomes square… */
const selectedSquare = {
  xs: 'data-selected:not-data-pressed:not-data-disabled:rounded-corner-medium',
  sm: 'data-selected:not-data-pressed:not-data-disabled:rounded-corner-medium',
  md: 'data-selected:not-data-pressed:not-data-disabled:rounded-corner-large',
  lg: 'data-selected:not-data-pressed:not-data-disabled:rounded-corner-extra-large',
  xl: 'data-selected:not-data-pressed:not-data-disabled:rounded-corner-extra-large',
} as const;

/** …and square becomes round (Compose `SelectedContainerShapeSquare` = full). */
const selectedFull = {
  xs: 'data-selected:not-data-pressed:not-data-disabled:rounded-[min(var(--md-sys-shape-corner-full),16px)]',
  sm: 'data-selected:not-data-pressed:not-data-disabled:rounded-[min(var(--md-sys-shape-corner-full),20px)]',
  md: 'data-selected:not-data-pressed:not-data-disabled:rounded-[min(var(--md-sys-shape-corner-full),28px)]',
  lg: 'data-selected:not-data-pressed:not-data-disabled:rounded-[min(var(--md-sys-shape-corner-full),48px)]',
  xl: 'data-selected:not-data-pressed:not-data-disabled:rounded-[min(var(--md-sys-shape-corner-full),68px)]',
} as const;

/** Container widths in px: narrow / default / wide. */
const widths = {
  xs: { narrow: 'w-[28px]', default: 'w-[32px]', wide: 'w-[40px]' },
  sm: { narrow: 'w-[32px]', default: 'w-[40px]', wide: 'w-[52px]' },
  md: { narrow: 'w-[48px]', default: 'w-[56px]', wide: 'w-[72px]' },
  lg: { narrow: 'w-[64px]', default: 'w-[96px]', wide: 'w-[128px]' },
  xl: { narrow: 'w-[104px]', default: 'w-[136px]', wide: 'w-[184px]' },
} as const;

type Size = keyof typeof full;
const SIZES = Object.keys(full) as Size[];
const WIDTHS = ['narrow', 'default', 'wide'] as const;

const sizeVariants = SIZES.flatMap((size) => [
  { size, connected: 'none' as const, shape: 'round' as const, class: { root: full[size] } },
  { size, connected: 'none' as const, shape: 'square' as const, class: { root: square[size] } },
  { size, connected: 'none' as const, class: { root: pressed[size] } },
  {
    size,
    connected: 'none' as const,
    toggle: true,
    shape: 'round' as const,
    class: { root: selectedSquare[size] },
  },
  {
    size,
    connected: 'none' as const,
    toggle: true,
    shape: 'square' as const,
    class: { root: selectedFull[size] },
  },
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
        root: 'bg-transparent text-[color:var(--md-comp-icon-button-icon-color,var(--md-sys-color-on-surface-variant))] data-disabled:text-on-surface/38',
      },
      filled: {
        root: 'bg-primary text-on-primary data-disabled:bg-on-surface/10 data-disabled:text-on-surface/38',
      },
      tonal: {
        root: 'bg-secondary-container text-on-secondary-container data-disabled:bg-on-surface/10 data-disabled:text-on-surface/38',
      },
      outlined: {
        root: 'border border-solid border-outline-variant bg-transparent text-[color:var(--md-comp-icon-button-icon-color,var(--md-sys-color-on-surface-variant))] data-disabled:not-data-selected:border-outline-variant/10 data-disabled:text-on-surface/38',
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
    // Toggle colours: unselected → selected.
    {
      variant: 'standard',
      toggle: true,
      class: { root: 'data-selected:not-data-disabled:text-primary' },
    },
    {
      variant: 'filled',
      toggle: true,
      class: {
        root: 'bg-surface-container text-on-surface-variant data-selected:not-data-disabled:bg-primary data-selected:not-data-disabled:text-on-primary',
      },
    },
    {
      variant: 'tonal',
      toggle: true,
      class: {
        root: 'data-selected:not-data-disabled:bg-secondary data-selected:not-data-disabled:text-on-secondary',
      },
    },
    {
      variant: 'outlined',
      toggle: true,
      class: {
        root: 'data-disabled:data-selected:bg-on-surface/10 data-selected:border-transparent data-selected:not-data-disabled:bg-inverse-surface data-selected:not-data-disabled:text-inverse-on-surface',
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
