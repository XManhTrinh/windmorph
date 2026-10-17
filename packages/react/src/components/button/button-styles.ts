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
 * The resting round and square corners come from the component tokens (`button-tokens.ts`,
 * `--md-comp-button-<size>-container-shape-*`). "Full" corners are capped at half the
 * container height instead of 9999px so the corner transition interpolates smoothly: the
 * set's derived `container-shape-round-capped`. Every class is written out in full:
 * Tailwind finds classes by scanning for literal strings.
 */
const round = 'rounded-[var(--_md-comp-button-container-shape-round-capped)]';
const square = 'rounded-[var(--_md-comp-button-container-shape-square)]';

const pressed = {
  xs: 'data-pressed:rounded-corner-small',
  sm: 'data-pressed:rounded-corner-small',
  md: 'data-pressed:rounded-corner-medium',
  lg: 'data-pressed:rounded-corner-large',
  xl: 'data-pressed:rounded-corner-large',
} as const;

type Size = keyof typeof pressed;
const SIZES = Object.keys(pressed) as Size[];

/** Toggle, selected: round buttons become square… */
const selectedSquare =
  'data-selected:not-data-pressed:not-data-disabled:rounded-[var(--_md-comp-button-container-shape-square)]';

/** …and square buttons become round. */
const selectedRound =
  'data-selected:not-data-pressed:not-data-disabled:rounded-[var(--_md-comp-button-container-shape-round-capped)]';

const shapeVariants = [
  { connected: 'none' as const, shape: 'round' as const, class: { root: round } },
  { connected: 'none' as const, shape: 'square' as const, class: { root: square } },
  ...SIZES.map((size) => ({ size, connected: 'none' as const, class: { root: pressed[size] } })),
  // Selected toggle buttons swap shape: round becomes square and square becomes round.
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

/**
 * Colours and elevation of each button variant, shared with the split button's halves.
 * The resting, selected and unselected colours, the elevated button's resting elevation and
 * the outline colour come from the component tokens (`button-tokens.ts`), so the element
 * needs `data-tokens="md-comp-button"` and `data-variant`, as Button and the split button's
 * halves render them. A consumer class (`bg-tertiary`) still wins in `cn()`. Disabled is `on-surface` 10% / `on-surface-variant` 38% for every variant.
 *
 * Hover raises a button only while it isn't pressed, so a press shows the pressed level
 * (elevated 1, filled and tonal 0) even under the pointer (2026-10-13).
 *
 * The outlined style's outline is drawn inside the container's edge spacing: its width is
 * `--m3-button-border` (1px; 2px at L, 3px at XL), and the padding subtracts it, so an
 * outlined button is the same size as the other styles with the same content (2026-10-13).
 * A selected outlined toggle has no outline, disabled or not, as on IconButton (2026-10-13).
 *
 * XS and S take a minimum height (32 / 40px) rather than a fixed one, so they grow around
 * text at a large browser font size, as Compose's `defaultMinSize` does; `h-fit` keeps a
 * stretching flex or grid parent from making them taller (2026-10-13).
 */
/**
 * The press morph on the default effects spring, which never bounces (`container-motion`
 * reads these). Shared with the split button's halves (2026-10-15).
 */
export const nonBouncingMorph =
  '[--m3-shape-spring-duration:var(--md-sys-motion-spring-effects-default-duration)] [--m3-shape-spring-easing:var(--md-sys-motion-spring-effects-default-easing)]';

/**
 * Forced colours (Windows high contrast), as Material Web's buttons: the browser paints
 * every container as `Canvas`, so a filled, elevated, tonal or text button draws a 1px
 * `CanvasText` boundary. It takes the outlined style's `--m3-button-border`, which the
 * padding already subtracts, so the button keeps its size (2026-10-15).
 */
const forcedBoundary =
  'forced-colors:[--m3-button-border:1px] forced-colors:border-(length:--m3-button-border) forced-colors:border-solid forced-colors:border-[CanvasText]';

/**
 * Forced colours for every button, its split button halves and icon buttons: disabled
 * ones are `GrayText`, and a selected toggle is filled with `Highlight` (and opts out of
 * the forced palette to keep it), so it can be told from an unselected one (2026-10-15).
 * They're `!important` to win over the selected and disabled colours, whose selectors are
 * as specific; they apply only in forced colours.
 */
export const forcedColorClasses = {
  disabled:
    'forced-colors:data-disabled:border-[GrayText]! forced-colors:data-disabled:text-[GrayText]!',
  selected:
    'forced-colors:data-selected:not-data-disabled:border-[Highlight]! forced-colors:data-selected:not-data-disabled:bg-[Highlight]! forced-colors:data-selected:not-data-disabled:text-[HighlightText]! forced-colors:data-selected:not-data-disabled:forced-color-adjust-none',
} as const;

export const buttonVariantClasses = {
  filled:
    'bg-[var(--_md-comp-button-container-color)] text-[color:var(--_md-comp-button-label-text-color)] shadow-[shadow:var(--_md-comp-button-container-elevation)] data-hovered:not-data-pressed:shadow-elevation-1 data-disabled:bg-on-surface/10 ' +
    forcedBoundary,
  elevated:
    'bg-[var(--_md-comp-button-container-color)] text-[color:var(--_md-comp-button-label-text-color)] shadow-[shadow:var(--_md-comp-button-container-elevation)] data-hovered:not-data-pressed:shadow-elevation-2 data-disabled:bg-on-surface/10 ' +
    forcedBoundary,
  tonal:
    'bg-[var(--_md-comp-button-container-color)] text-[color:var(--_md-comp-button-label-text-color)] shadow-[shadow:var(--_md-comp-button-container-elevation)] data-hovered:not-data-pressed:shadow-elevation-1 data-disabled:bg-on-surface/10 ' +
    forcedBoundary,
  outlined:
    '[--m3-button-border:1px] border-(length:--m3-button-border) border-solid border-[color:var(--_md-comp-button-outline-color)] bg-[var(--_md-comp-button-container-color)] text-[color:var(--_md-comp-button-label-text-color)] shadow-[shadow:var(--_md-comp-button-container-elevation)] data-disabled:not-data-selected:border-outline-variant/10',
  text:
    'bg-[var(--_md-comp-button-container-color)] text-[color:var(--_md-comp-button-label-text-color)] shadow-[shadow:var(--_md-comp-button-container-elevation)] ' +
    forcedBoundary,
} as const;

/** Variant definitions for {@link Button}; extend them to add variants. */
export const buttonStyles = tv({
  slots: {
    root: [
      'inline-flex shrink-0 cursor-pointer items-center justify-center align-middle',
      'font-plain whitespace-nowrap select-none',
      'state-layer focus-ring container-motion',
      'data-disabled:cursor-default data-disabled:text-on-surface-variant/38 data-disabled:shadow-elevation-0',
      forcedColorClasses.disabled,
    ],
    // Library-owned inner wrapper: holds the touch target, never receives consumer layout. It
    // never shrinks: in a button narrower than its content (a button group's compressed
    // neighbour) the content stays centred, giving up the padding equally on both sides
    // (2026-10-15).
    content: 'relative inline-flex shrink-0 items-center justify-center',
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
        root: 'h-fit min-h-[32px] min-w-[58px] px-[calc(16px-var(--m3-button-border,0px))] text-label-large',
        content: 'gap-[8px]',
        icon: 'size-[20px]',
      },
      sm: {
        root: 'h-fit min-h-[40px] min-w-[58px] px-[calc(16px-var(--m3-button-border,0px))] text-label-large',
        content: 'gap-[8px]',
        icon: 'size-[20px]',
      },
      md: {
        root: 'h-[56px] px-[calc(24px-var(--m3-button-border,0px))] text-title-medium',
        content: 'gap-[8px]',
        icon: 'size-[24px]',
      },
      lg: {
        root: 'h-[96px] px-[calc(48px-var(--m3-button-border,0px))] font-brand text-headline-small',
        content: 'gap-[12px]',
        icon: 'size-[32px]',
      },
      xl: {
        root: 'h-[136px] px-[calc(64px-var(--m3-button-border,0px))] font-brand text-headline-large',
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
    // A plain button's press morph runs on the default effects spring, which never bounces
    // (Compose's Button: "DefaultEffects is intentional here"); a toggle's selection morph
    // keeps the fast spatial spring, as Compose's ToggleButton (2026-10-15).
    { toggle: false, class: { root: nonBouncingMorph } },
    ...connectedShapeVariants,
    // Outline width grows with size.
    { variant: 'outlined', size: 'lg', class: { root: '[--m3-button-border:2px]' } },
    { variant: 'outlined', size: 'xl', class: { root: '[--m3-button-border:3px]' } },
    // Toggle colours: unselected → selected, from the component tokens.
    {
      toggle: true,
      class: {
        root: [
          'bg-[var(--_md-comp-button-unselected-container-color)] text-[color:var(--_md-comp-button-unselected-label-text-color)] data-selected:not-data-disabled:bg-[var(--_md-comp-button-selected-container-color)] data-selected:not-data-disabled:text-[color:var(--_md-comp-button-selected-label-text-color)]',
          forcedColorClasses.selected,
        ],
      },
    },
    {
      variant: 'outlined',
      toggle: true,
      // Disabled: unselected outline-variant at 10%; selected on-surface at 10%, as
      // `OutlinedButtonTokens.SelectedDisabledContainerColor` and the outlined icon button
      // (2026-10-15).
      class: {
        root: 'data-disabled:not-data-selected:bg-outline-variant/10 data-disabled:data-selected:bg-on-surface/10 data-selected:border-transparent',
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

/**
 * The variants of {@link buttonStyles}, for building on its styles. They are the recipe's keys, not
 * component props: their names (`hasIcon`, `isOpen`…) follow the classes and may change.
 */
export type ButtonStyleProps = VariantProps<typeof buttonStyles>;
export type ButtonVariant = NonNullable<ButtonStyleProps['variant']>;
export type ButtonSize = NonNullable<ButtonStyleProps['size']>;
export type ButtonShape = NonNullable<ButtonStyleProps['shape']>;
