import { tv, type VariantProps } from '../../utils/tv';

/*
 * Values follow Compose Material 3 (IconButton.kt, IconButtonDefaults.kt and the
 * *IconButtonTokens files). Width = icon size + leading + trailing space; Compose's
 * "Uniform" width option is the default width. Standard and outlined icon buttons take
 * the surrounding content colour (Compose's LocalContentColor), and the outline is
 * drawn in that colour. Every class is written out in full so Tailwind can find it.
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

/**
 * Connected button group corners (Compose `ButtonGroupDefaults.connected*Shapes`): outer
 * corners stay full, inner corners are small (8px), extra-small (4px) while pressed, and
 * the whole button becomes full when selected. Compose defines one set for all sizes.
 */
const connectedShapes = [
  {
    size: 'xs',
    connected: 'leading',
    class: {
      root: 'rounded-s-[min(var(--md-sys-shape-corner-full),16px)] rounded-e-corner-small data-pressed:rounded-e-corner-extra-small data-selected:not-data-pressed:not-data-disabled:rounded-e-[min(var(--md-sys-shape-corner-full),16px)]',
    },
  },
  {
    size: 'xs',
    connected: 'middle',
    class: {
      root: 'rounded-corner-small data-pressed:rounded-corner-extra-small data-selected:not-data-pressed:not-data-disabled:rounded-[min(var(--md-sys-shape-corner-full),16px)]',
    },
  },
  {
    size: 'xs',
    connected: 'trailing',
    class: {
      root: 'rounded-e-[min(var(--md-sys-shape-corner-full),16px)] rounded-s-corner-small data-pressed:rounded-s-corner-extra-small data-selected:not-data-pressed:not-data-disabled:rounded-s-[min(var(--md-sys-shape-corner-full),16px)]',
    },
  },
  {
    size: 'sm',
    connected: 'leading',
    class: {
      root: 'rounded-s-[min(var(--md-sys-shape-corner-full),20px)] rounded-e-corner-small data-pressed:rounded-e-corner-extra-small data-selected:not-data-pressed:not-data-disabled:rounded-e-[min(var(--md-sys-shape-corner-full),20px)]',
    },
  },
  {
    size: 'sm',
    connected: 'middle',
    class: {
      root: 'rounded-corner-small data-pressed:rounded-corner-extra-small data-selected:not-data-pressed:not-data-disabled:rounded-[min(var(--md-sys-shape-corner-full),20px)]',
    },
  },
  {
    size: 'sm',
    connected: 'trailing',
    class: {
      root: 'rounded-e-[min(var(--md-sys-shape-corner-full),20px)] rounded-s-corner-small data-pressed:rounded-s-corner-extra-small data-selected:not-data-pressed:not-data-disabled:rounded-s-[min(var(--md-sys-shape-corner-full),20px)]',
    },
  },
  {
    size: 'md',
    connected: 'leading',
    class: {
      root: 'rounded-s-[min(var(--md-sys-shape-corner-full),28px)] rounded-e-corner-small data-pressed:rounded-e-corner-extra-small data-selected:not-data-pressed:not-data-disabled:rounded-e-[min(var(--md-sys-shape-corner-full),28px)]',
    },
  },
  {
    size: 'md',
    connected: 'middle',
    class: {
      root: 'rounded-corner-small data-pressed:rounded-corner-extra-small data-selected:not-data-pressed:not-data-disabled:rounded-[min(var(--md-sys-shape-corner-full),28px)]',
    },
  },
  {
    size: 'md',
    connected: 'trailing',
    class: {
      root: 'rounded-e-[min(var(--md-sys-shape-corner-full),28px)] rounded-s-corner-small data-pressed:rounded-s-corner-extra-small data-selected:not-data-pressed:not-data-disabled:rounded-s-[min(var(--md-sys-shape-corner-full),28px)]',
    },
  },
  {
    size: 'lg',
    connected: 'leading',
    class: {
      root: 'rounded-s-[min(var(--md-sys-shape-corner-full),48px)] rounded-e-corner-small data-pressed:rounded-e-corner-extra-small data-selected:not-data-pressed:not-data-disabled:rounded-e-[min(var(--md-sys-shape-corner-full),48px)]',
    },
  },
  {
    size: 'lg',
    connected: 'middle',
    class: {
      root: 'rounded-corner-small data-pressed:rounded-corner-extra-small data-selected:not-data-pressed:not-data-disabled:rounded-[min(var(--md-sys-shape-corner-full),48px)]',
    },
  },
  {
    size: 'lg',
    connected: 'trailing',
    class: {
      root: 'rounded-e-[min(var(--md-sys-shape-corner-full),48px)] rounded-s-corner-small data-pressed:rounded-s-corner-extra-small data-selected:not-data-pressed:not-data-disabled:rounded-s-[min(var(--md-sys-shape-corner-full),48px)]',
    },
  },
  {
    size: 'xl',
    connected: 'leading',
    class: {
      root: 'rounded-s-[min(var(--md-sys-shape-corner-full),68px)] rounded-e-corner-small data-pressed:rounded-e-corner-extra-small data-selected:not-data-pressed:not-data-disabled:rounded-e-[min(var(--md-sys-shape-corner-full),68px)]',
    },
  },
  {
    size: 'xl',
    connected: 'middle',
    class: {
      root: 'rounded-corner-small data-pressed:rounded-corner-extra-small data-selected:not-data-pressed:not-data-disabled:rounded-[min(var(--md-sys-shape-corner-full),68px)]',
    },
  },
  {
    size: 'xl',
    connected: 'trailing',
    class: {
      root: 'rounded-e-[min(var(--md-sys-shape-corner-full),68px)] rounded-s-corner-small data-pressed:rounded-s-corner-extra-small data-selected:not-data-pressed:not-data-disabled:rounded-s-[min(var(--md-sys-shape-corner-full),68px)]',
    },
  },
] as const;

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
      standard: { root: 'bg-transparent text-inherit data-disabled:text-current/38' },
      filled: {
        root: 'bg-primary text-on-primary data-disabled:bg-on-surface/10 data-disabled:text-on-surface/38',
      },
      tonal: {
        root: 'bg-secondary-container text-on-secondary-container data-disabled:bg-on-surface/10 data-disabled:text-on-surface/38',
      },
      outlined: {
        root: 'border border-solid border-current bg-transparent text-inherit data-disabled:text-current/38',
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
  },
  compoundVariants: [
    ...sizeVariants,
    ...connectedShapes,
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
        root: 'data-selected:not-data-disabled:border-transparent data-selected:not-data-disabled:bg-inverse-surface data-selected:not-data-disabled:text-inverse-on-surface',
      },
    },
  ],
  defaultVariants: {
    variant: 'standard',
    size: 'sm',
    width: 'default',
    shape: 'round',
    toggle: false,
    connected: 'none',
  },
});

export type IconButtonStyleProps = VariantProps<typeof iconButtonStyles>;
export type IconButtonVariant = NonNullable<IconButtonStyleProps['variant']>;
export type IconButtonWidth = NonNullable<IconButtonStyleProps['width']>;
