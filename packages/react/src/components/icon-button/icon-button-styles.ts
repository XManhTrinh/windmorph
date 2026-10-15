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
 * are capped at half the height (the set's derived `container-shape-round-capped`), and at half
 * the dense height too.
 */
const round =
  'rounded-[min(var(--_md-comp-icon-button-container-shape-round-capped),calc(var(--m3-icon-button-height)/2))]';
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
  'data-selected:not-data-pressed:not-data-disabled:rounded-[min(var(--_md-comp-icon-button-container-shape-round-capped),calc(var(--m3-icon-button-height)/2))]';

/*
 * Web density (`--md-sys-density`, 0 to -3; M3: "Avoid applying density by default … give
 * people a way to choose a higher density"): each step takes 4px off the container's height
 * and width, as Material Components Web's icon button density did (48px, 4px a step, to 28px:
 * the 24px icon and 2px on each side). Here every size and width follows, never below its
 * icon plus 4px (24px at XS, 28px at S). The touch target stays 48 × 48px, extending past
 * the container (`TouchTarget` at XS and S, the content's `::after` at M). The round corners'
 * cap follows the height.
 */

/** Container widths in px: narrow / default / wide, 4px less per density step. */
const widths = {
  xs: {
    narrow: 'w-[max(24px,calc(28px+var(--md-sys-density,0)*4px))]',
    default: 'w-[max(24px,calc(32px+var(--md-sys-density,0)*4px))]',
    wide: 'w-[calc(40px+var(--md-sys-density,0)*4px)]',
  },
  sm: {
    narrow: 'w-[max(28px,calc(32px+var(--md-sys-density,0)*4px))]',
    default: 'w-[calc(40px+var(--md-sys-density,0)*4px)]',
    wide: 'w-[calc(52px+var(--md-sys-density,0)*4px)]',
  },
  md: {
    narrow: 'w-[calc(48px+var(--md-sys-density,0)*4px)]',
    default: 'w-[calc(56px+var(--md-sys-density,0)*4px)]',
    wide: 'w-[calc(72px+var(--md-sys-density,0)*4px)]',
  },
  lg: {
    narrow: 'w-[calc(64px+var(--md-sys-density,0)*4px)]',
    default: 'w-[calc(96px+var(--md-sys-density,0)*4px)]',
    wide: 'w-[calc(128px+var(--md-sys-density,0)*4px)]',
  },
  xl: {
    narrow: 'w-[calc(104px+var(--md-sys-density,0)*4px)]',
    default: 'w-[calc(136px+var(--md-sys-density,0)*4px)]',
    wide: 'w-[calc(184px+var(--md-sys-density,0)*4px)]',
  },
} as const;

/**
 * In a connected button group, the width is a minimum: the group's equal columns stretch the
 * button (2026-10-15). Extra small and small connected buttons are at least 48px wide (button
 * group specs).
 */
const connectedWidths = {
  xs: {
    narrow: 'w-auto min-w-[48px]',
    default: 'w-auto min-w-[48px]',
    wide: 'w-auto min-w-[48px]',
  },
  sm: {
    narrow: 'w-auto min-w-[48px]',
    default: 'w-auto min-w-[48px]',
    wide: 'w-auto min-w-[52px]',
  },
  md: {
    narrow: 'w-auto min-w-[48px]',
    default: 'w-auto min-w-[56px]',
    wide: 'w-auto min-w-[72px]',
  },
  lg: {
    narrow: 'w-auto min-w-[64px]',
    default: 'w-auto min-w-[96px]',
    wide: 'w-auto min-w-[128px]',
  },
  xl: {
    narrow: 'w-auto min-w-[104px]',
    default: 'w-auto min-w-[136px]',
    wide: 'w-auto min-w-[184px]',
  },
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
  ...WIDTHS.map((width) => ({
    size,
    width,
    connected: ['leading' as const, 'middle' as const, 'trailing' as const],
    class: { root: connectedWidths[size][width] },
  })),
]);

/** Variant definitions for {@link IconButton}; extend them to add variants. */
export const iconButtonStyles = tv({
  slots: {
    root: [
      'inline-flex shrink-0 cursor-pointer items-center justify-center p-0 align-middle select-none',
      // The height, per size (`--m3-icon-button-height`).
      'h-[var(--m3-icon-button-height)]',
      'state-layer focus-ring container-motion',
      // Every morph, toggles included, on the default effects spring, which never bounces:
      // Compose's IconButton "DefaultEffects is intentional here to prevent any bounce".
      '[--m3-shape-spring-duration:var(--md-sys-motion-spring-effects-default-duration)]',
      '[--m3-shape-spring-easing:var(--md-sys-motion-spring-effects-default-easing)]',
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
    // Heights: 32 / 40 / 56 / 96 / 136px, 4px less per density step.
    size: {
      xs: {
        root: '[--m3-icon-button-height:max(24px,calc(32px+var(--md-sys-density,0)*4px))]',
        icon: 'size-[20px]',
      },
      sm: {
        root: '[--m3-icon-button-height:calc(40px+var(--md-sys-density,0)*4px)]',
        icon: 'size-[24px]',
      },
      md: {
        root: '[--m3-icon-button-height:calc(56px+var(--md-sys-density,0)*4px)]',
        // A dense M (narrow from -1, every width at -3) is under 48px: its content's `::after`
        // is the touch target (`TouchTarget`'s box, without adding an element at density 0).
        content:
          "after:absolute after:top-1/2 after:left-1/2 after:h-12 after:w-[max(100%,3rem)] after:-translate-x-1/2 after:-translate-y-1/2 after:content-['']",
        icon: 'size-[24px]',
      },
      lg: {
        root: '[--m3-icon-button-height:calc(96px+var(--md-sys-density,0)*4px)]',
        icon: 'size-[32px]',
      },
      xl: {
        root: '[--m3-icon-button-height:calc(136px+var(--md-sys-density,0)*4px)]',
        icon: 'size-[40px]',
      },
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
