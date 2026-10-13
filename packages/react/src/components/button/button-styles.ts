import { tv, type VariantProps } from '../../utils/tv';
import { connectedShapeVariants } from './connected-shapes';

/*
 * Values follow the M3 Expressive button specs and Compose's Button*Tokens files
 * (2026-10-13): text buttons use `primary`; XS buttons have 16px padding and an 8px icon
 * gap (`ButtonXSmallTokens`); small text buttons have the same 16px padding as the other
 * small buttons ("24dp: Not recommended. Use 16dp"); and every button, toggles included,
 * presses to 8 / 8 / 12 / 16 / 16px ("Both round and square buttons should have the same
 * pressed shape").
 *
 * "Full" corners are capped at half the container height instead of 9999px so the
 * corner transition interpolates smoothly; `--md-sys-shape-corner-full` still applies.
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

type Size = keyof typeof full;
const SIZES = Object.keys(full) as Size[];

/*
 * Every class is written out in full: Tailwind finds classes by scanning for literal
 * strings, so classes assembled at runtime would never be generated.
 */

/** Toggle, selected: round buttons become square… */
const selectedSquare = {
  xs: 'data-selected:not-data-pressed:not-data-disabled:rounded-corner-medium',
  sm: 'data-selected:not-data-pressed:not-data-disabled:rounded-corner-medium',
  md: 'data-selected:not-data-pressed:not-data-disabled:rounded-corner-large',
  lg: 'data-selected:not-data-pressed:not-data-disabled:rounded-corner-extra-large',
  xl: 'data-selected:not-data-pressed:not-data-disabled:rounded-corner-extra-large',
} as const;

/** …and square buttons become round. */
const selectedFull = {
  xs: 'data-selected:not-data-pressed:not-data-disabled:rounded-[min(var(--md-sys-shape-corner-full),16px)]',
  sm: 'data-selected:not-data-pressed:not-data-disabled:rounded-[min(var(--md-sys-shape-corner-full),20px)]',
  md: 'data-selected:not-data-pressed:not-data-disabled:rounded-[min(var(--md-sys-shape-corner-full),28px)]',
  lg: 'data-selected:not-data-pressed:not-data-disabled:rounded-[min(var(--md-sys-shape-corner-full),48px)]',
  xl: 'data-selected:not-data-pressed:not-data-disabled:rounded-[min(var(--md-sys-shape-corner-full),68px)]',
} as const;

const shapeVariants = SIZES.flatMap((size) => [
  { size, connected: 'none' as const, shape: 'round' as const, class: { root: full[size] } },
  { size, connected: 'none' as const, shape: 'square' as const, class: { root: square[size] } },
  { size, connected: 'none' as const, class: { root: pressed[size] } },
  // Selected toggle buttons swap shape: round becomes square and square becomes round.
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
]);

/**
 * Colours and elevation of each button variant, shared with the split button's halves.
 * Disabled is `on-surface` 10% / `on-surface-variant` 38% for every variant.
 */
export const buttonVariantClasses = {
  filled:
    'bg-primary text-on-primary data-hovered:shadow-elevation-1 data-disabled:bg-on-surface/10',
  elevated:
    'bg-surface-container-low text-primary shadow-elevation-1 data-hovered:shadow-elevation-2 data-disabled:bg-on-surface/10',
  tonal:
    'bg-secondary-container text-on-secondary-container data-hovered:shadow-elevation-1 data-disabled:bg-on-surface/10',
  outlined:
    'border border-solid border-outline-variant bg-transparent text-on-surface-variant data-disabled:border-outline-variant/10',
  text: 'bg-transparent text-primary',
} as const;

/** Variant definitions for {@link Button}; extend them to add variants. */
export const buttonStyles = tv({
  slots: {
    root: [
      'inline-flex shrink-0 cursor-pointer items-center justify-center align-middle',
      'font-plain whitespace-nowrap select-none',
      'state-layer focus-ring container-motion',
      'data-disabled:cursor-default data-disabled:text-on-surface-variant/38 data-disabled:shadow-elevation-0',
    ],
    // Library-owned inner wrapper: holds the touch target, never receives consumer layout.
    content: 'relative inline-flex min-w-0 items-center justify-center',
    label: 'min-w-0',
    icon: 'inline-flex shrink-0 items-center justify-center [&>svg]:size-full',
  },
  variants: {
    variant: {
      filled: { root: buttonVariantClasses.filled },
      elevated: { root: buttonVariantClasses.elevated },
      tonal: { root: buttonVariantClasses.tonal },
      outlined: { root: buttonVariantClasses.outlined },
      text: { root: buttonVariantClasses.text },
    },
    size: {
      xs: {
        root: 'h-[32px] min-w-[58px] px-[16px] text-label-large',
        content: 'gap-[8px]',
        icon: 'size-[20px]',
      },
      sm: {
        root: 'h-[40px] min-w-[58px] px-[16px] text-label-large',
        content: 'gap-[8px]',
        icon: 'size-[20px]',
      },
      md: {
        root: 'h-[56px] px-[24px] text-title-medium',
        content: 'gap-[8px]',
        icon: 'size-[24px]',
      },
      lg: {
        root: 'h-[96px] px-[48px] font-brand text-headline-small',
        content: 'gap-[12px]',
        icon: 'size-[32px]',
      },
      xl: {
        root: 'h-[136px] px-[64px] font-brand text-headline-large',
        content: 'gap-[16px]',
        icon: 'size-[40px]',
      },
    },
    shape: {
      round: {},
      square: {},
    },
    toggle: {
      true: {},
      false: {},
    },
    /** Position in a connected button group, set by `ButtonGroup`. */
    connected: { none: {}, leading: {}, middle: {}, trailing: {} },
  },
  compoundVariants: [
    ...shapeVariants,
    ...connectedShapeVariants,
    // Outline width grows with size.
    { variant: 'outlined', size: 'lg', class: { root: 'border-2' } },
    { variant: 'outlined', size: 'xl', class: { root: 'border-3' } },
    // Toggle colours: unselected → selected.
    {
      variant: 'filled',
      toggle: true,
      class: {
        root: 'bg-surface-container text-on-surface-variant data-selected:not-data-disabled:bg-primary data-selected:not-data-disabled:text-on-primary',
      },
    },
    {
      variant: 'elevated',
      toggle: true,
      class: {
        root: 'data-selected:not-data-disabled:bg-primary data-selected:not-data-disabled:text-on-primary',
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
        root: 'data-disabled:bg-outline-variant/10 data-selected:not-data-disabled:border-transparent data-selected:not-data-disabled:bg-inverse-surface data-selected:not-data-disabled:text-inverse-on-surface',
      },
    },
  ],
  defaultVariants: {
    variant: 'filled',
    size: 'sm',
    shape: 'round',
    toggle: false,
    connected: 'none',
  },
});

export type ButtonStyleProps = VariantProps<typeof buttonStyles>;
export type ButtonVariant = NonNullable<ButtonStyleProps['variant']>;
export type ButtonSize = NonNullable<ButtonStyleProps['size']>;
export type ButtonShape = NonNullable<ButtonStyleProps['shape']>;
