import { tv, type VariantProps } from '../../utils/tv';

/*
 * Values follow the M3 Expressive spec and its tokens (the Fab* / ExtendedFab* token
 * files): medium FABs use the large-increased corner (20px), the large FAB icon is 32px,
 * and extended FABs put 8 / 16 / 20px between icon and label. FABs have no press morph
 * and no disabled state.
 *
 * The container colour, content colour and corners come from the component tokens
 * (`fab-tokens.ts`, `--md-comp-fab-*` and `--md-comp-extended-fab-*`): the root carries
 * `data-tokens`, `data-color` and `data-size`, and the classes read one private variable per
 * part. A consumer class (`bg-tertiary`, `rounded-corner-small`) still wins in `cn()`.
 *
 * Every class is written out in full so Tailwind can find it.
 */

/**
 * Colour styles: the three tonal containers (Compose tokens) and the three vibrant roles.
 * Their colours are the tokens' defaults; extend them with classes to add a style.
 */
const colors = {
  'primary-container': {},
  'secondary-container': {},
  'tertiary-container': {},
  primary: {},
  secondary: {},
  tertiary: {},
} as const;

const elevation = {
  // FabPrimaryContainerTokens: level 3, hover 4, pressed 3 (the hover level never applies
  // while pressed, even with the pointer still over the FAB).
  default: { root: 'shadow-elevation-3 data-hovered:not-data-pressed:shadow-elevation-4' },
  // loweredElevation(): level 1, hover 2, pressed 1.
  lowered: { root: 'shadow-elevation-1 data-hovered:not-data-pressed:shadow-elevation-2' },
  // Nested in another component, such as the navigation rail: level 0 in every state.
  flat: { root: 'shadow-elevation-0' },
} as const;

const base = [
  'inline-flex shrink-0 cursor-pointer items-center justify-center align-middle select-none',
  'font-plain whitespace-nowrap',
  'state-layer focus-ring',
  /*
   * Appearing and disappearing: the FAB expands from its centre (scale 0.2 → 1, as
   * Compose's animateFloatingActionButton) on the fast spatial spring and fades on the fast
   * effects spring. The scale is a `transform` set only while hidden or appearing, so it
   * composes with Tailwind's `translate-*` / `scale-*` utilities (separate properties) and
   * the root is never a containing block at rest. Reduced motion keeps only the fade.
   */
  'data-hidden:invisible data-hidden:[transform:scale(0.2)] data-hidden:opacity-0',
  'data-appear:starting:[transform:scale(0.2)] data-appear:starting:opacity-0',
  'motion-reduce:data-hidden:[transform:none] motion-reduce:data-appear:starting:[transform:none]',
  '[--m3-transition-property:background-color,color,box-shadow,transform,opacity,visibility]',
  '[--m3-transition-duration:var(--md-sys-motion-spring-effects-fast-duration),var(--md-sys-motion-spring-effects-fast-duration),var(--md-sys-motion-spring-effects-fast-duration),var(--md-sys-motion-spring-spatial-fast-duration),var(--md-sys-motion-spring-effects-fast-duration),max(var(--md-sys-motion-spring-spatial-fast-duration),var(--md-sys-motion-spring-effects-fast-duration))]',
  '[--m3-transition-easing:var(--md-sys-motion-spring-effects-fast-easing),var(--md-sys-motion-spring-effects-fast-easing),var(--md-sys-motion-spring-effects-fast-easing),var(--md-sys-motion-spring-spatial-fast-easing),var(--md-sys-motion-spring-effects-fast-easing),linear]',
  '[--m3-transition-delay:0s,0s,0s,0s,0s,0s]',
];

/** Variant definitions for {@link Fab}; extend them to add colour styles. */
export const fabStyles = tv({
  slots: {
    root: [
      ...base,
      'bg-[var(--_md-comp-fab-container-color)] text-[color:var(--_md-comp-fab-icon-color)]',
      'rounded-[var(--_md-comp-fab-container-shape)]',
    ],
    icon: 'inline-flex shrink-0 items-center justify-center [&>svg]:size-full',
  },
  variants: {
    color: colors,
    elevation,
    size: {
      default: { root: 'size-[56px]', icon: 'size-[24px]' },
      medium: { root: 'size-[80px]', icon: 'size-[28px]' },
      large: { root: 'size-[96px]', icon: 'size-[32px]' },
    },
  },
  defaultVariants: { color: 'primary-container', elevation: 'default', size: 'default' },
});

/** Variant definitions for {@link ExtendedFab}. */
export const extendedFabStyles = tv({
  slots: {
    root: [
      ...base,
      // The label collapsing and expanding resizes it in place, so it is never the
      // browser's scroll anchor (which would scroll the page to follow it).
      '[overflow-anchor:none]',
      'bg-[var(--_md-comp-extended-fab-container-color)]',
      'text-[color:var(--_md-comp-extended-fab-label-text-color)]',
      'rounded-[var(--_md-comp-extended-fab-container-shape)]',
    ],
    // Library-owned inner wrapper for the icon and the collapsing label.
    content: 'inline-flex items-center',
    icon: 'inline-flex shrink-0 items-center justify-center [&>svg]:size-full',
    // The label column animates between 0fr and 1fr, so the FAB's width follows it.
    collapse: [
      'grid grid-cols-[1fr] opacity-100',
      '[transition-property:grid-template-columns,opacity]',
      // All component motion runs on the fast spatial and fast effects springs.
      '[transition-duration:var(--md-sys-motion-spring-spatial-fast-duration),var(--md-sys-motion-spring-effects-fast-duration)]',
      '[transition-timing-function:var(--md-sys-motion-spring-spatial-fast-easing),var(--md-sys-motion-spring-effects-fast-easing)]',
      'data-collapsed:grid-cols-[0fr] data-collapsed:opacity-0',
    ],
    // Clips the label while collapsing; the icon gap lives on `text` so it clips too.
    label: 'min-w-0 overflow-hidden',
    text: '',
  },
  variants: {
    color: colors,
    elevation,
    size: {
      sm: {
        root: 'h-[56px] min-w-[56px] ps-[16px] pe-[16px] text-title-medium',
        icon: 'size-[24px]',
        text: 'ps-[8px]',
      },
      md: {
        root: 'h-[80px] min-w-[80px] ps-[26px] pe-[26px] text-title-large',
        icon: 'size-[28px]',
        text: 'ps-[16px]',
      },
      lg: {
        root: 'h-[96px] min-w-[96px] ps-[28px] pe-[28px] font-brand text-headline-small',
        icon: 'size-[32px]',
        text: 'ps-[20px]',
      },
    },
    hasIcon: {
      true: {},
      // Text-only extended FABs have no icon gap.
      false: { text: 'ps-0' },
    },
  },
  defaultVariants: { color: 'primary-container', elevation: 'default', size: 'sm', hasIcon: true },
});

export type FabStyleProps = VariantProps<typeof fabStyles>;
export type ExtendedFabStyleProps = VariantProps<typeof extendedFabStyles>;
export type FabColor = NonNullable<FabStyleProps['color']>;
export type FabSize = NonNullable<FabStyleProps['size']>;
export type FabElevation = NonNullable<FabStyleProps['elevation']>;
export type ExtendedFabSize = NonNullable<ExtendedFabStyleProps['size']>;
