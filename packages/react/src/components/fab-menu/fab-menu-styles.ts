import { tv, type VariantProps } from '../../utils/tv';

/*
 * Values follow the M3 Expressive spec and its tokens (FabMenuBaselineTokens), with
 * Compose Material 3's FloatingActionButtonMenu.kt as the recipe:
 *
 * - The toggle button keeps its FAB's layout box (56 / 80 / 96px) and, when open, shrinks to
 *   the 56px close button with full corners and a 20px icon, its container going from the
 *   `*-container` role to the vibrant role. Size, corners and icon follow the fast spatial
 *   spring, as Compose's `checkedProgress` does; the colours move on the fast effects spring,
 *   which the motion spec asks for colour (no overshoot).
 * - Items are 56px pills (min width 56px, 24px side padding, 8px icon gap, 24px icon,
 *   `title-medium`), 4px apart, 8px above the button. Item width springs on fast spatial
 *   and opacity on fast effects. Under reduced motion the spatial springs are instant
 *   (architecture §6): the button changes at once and the items only fade, together.
 * - Elevation, as on `Fab`, is the `elevation` variant, on the button and the items alike:
 *   `default` is level 3 (the spec's ListItemContainerElevation token, and the FAB's),
 *   `lowered` level 1 and `flat` level 0.
 * - The menu sits on the window's trailing edge (logical, so it mirrors in RTL).
 * - On short windows the list scrolls behind the close button: it extends under the
 *   button's box (a negative margin cancelled by padding, so nothing moves) and the box
 *   paints above it. 16px of padding on the other sides keeps the items' shadows and focus
 *   rings inside the scroll container; that ring lets clicks through.
 *
 * Colour styles are m3.material.io's primary / secondary / tertiary sets; Compose's
 * defaults are the primary set. The close button's and the items' corners come from the
 * component tokens (`fab-menu-tokens.ts`, `--md-comp-fab-menu-*`), resolved on the root.
 * Every class is written out in full so Tailwind can find it.
 */

const colors = {
  primary: {
    button:
      'bg-primary-container text-on-primary-container data-open:bg-primary data-open:text-on-primary',
    item: 'bg-primary-container text-on-primary-container',
  },
  secondary: {
    button:
      'bg-secondary-container text-on-secondary-container data-open:bg-secondary data-open:text-on-secondary',
    item: 'bg-secondary-container text-on-secondary-container',
  },
  tertiary: {
    button:
      'bg-tertiary-container text-on-tertiary-container data-open:bg-tertiary data-open:text-on-tertiary',
    item: 'bg-tertiary-container text-on-tertiary-container',
  },
} as const;

/** Variant definitions for {@link FabMenu}; extend them to add colour styles. */
export const fabMenuStyles = tv({
  slots: {
    root: 'inline-flex flex-col-reverse items-end gap-[8px]',
    // Library-owned box that keeps the FAB's size while the button shrinks inside it. It
    // paints above the list, which scrolls behind it, and carries the show / hide motion
    // (the FAB's: scale from the centre on fast spatial, fade on fast effects).
    anchor: [
      'relative z-[1] inline-flex shrink-0 items-start justify-end',
      'data-hidden:invisible data-hidden:[transform:scale(0.2)] data-hidden:opacity-0',
      'data-appear:starting:[transform:scale(0.2)] data-appear:starting:opacity-0',
      'motion-reduce:data-hidden:[transform:none] motion-reduce:data-appear:starting:[transform:none]',
      '[transition-property:transform,opacity,visibility]',
      '[transition-duration:var(--md-sys-motion-spring-spatial-fast-duration),var(--md-sys-motion-spring-effects-fast-duration),var(--md-sys-motion-spring-spatial-fast-duration)]',
      '[transition-timing-function:var(--md-sys-motion-spring-spatial-fast-easing),var(--md-sys-motion-spring-effects-fast-easing),linear]',
    ],
    button: [
      'group/fab-menu inline-flex shrink-0 cursor-pointer items-center justify-center select-none',
      'state-layer focus-ring',
      // Open: the 56px close button, its corners half its size (a length, so they interpolate).
      'data-open:size-[56px] data-open:rounded-[var(--_md-comp-fab-menu-close-button-container-shape)]',
      '[--m3-transition-property:width,height,border-radius,background-color,color]',
      // Size and corners on the fast spatial spring; colours on fast effects (no overshoot).
      '[--m3-transition-duration:var(--md-sys-motion-spring-spatial-fast-duration),var(--md-sys-motion-spring-spatial-fast-duration),var(--md-sys-motion-spring-spatial-fast-duration),var(--md-sys-motion-spring-effects-fast-duration),var(--md-sys-motion-spring-effects-fast-duration)]',
      '[--m3-transition-easing:var(--md-sys-motion-spring-spatial-fast-easing),var(--md-sys-motion-spring-spatial-fast-easing),var(--md-sys-motion-spring-spatial-fast-easing),var(--md-sys-motion-spring-effects-fast-easing),var(--md-sys-motion-spring-effects-fast-easing)]',
      '[--m3-transition-delay:0s,0s,0s,0s,0s]',
    ],
    // The FAB "transforms into the close button" (M3): with `openIcon`, both icons share
    // this cell as faces (primitives/icon-faces-styles.ts) and hand over with `iconTransition`.
    icon: [
      'inline-grid shrink-0 place-items-center [&>svg]:size-full',
      'group-data-open/fab-menu:size-[20px]',
      '[transition-property:width,height]',
      '[transition-duration:var(--md-sys-motion-spring-spatial-fast-duration)]',
      '[transition-timing-function:var(--md-sys-motion-spring-spatial-fast-easing)]',
    ],
    list: [
      'flex flex-col items-end gap-[4px] overflow-y-auto overscroll-contain',
      '-ms-[16px] -me-[16px] -mt-[16px] ps-[16px] pe-[16px] pt-[16px] pointer-events-none',
      // The list's box ends at the bottom of the button's box, 16px above the window edge.
      'max-h-[calc(100dvh-16px)]',
    ],
    item: [
      'pointer-events-auto flex h-[56px] shrink-0 cursor-pointer justify-end overflow-hidden select-none',
      'rounded-[var(--_md-comp-fab-menu-menu-item-container-shape)]',
      'opacity-0 data-visible:opacity-100',
      // Under reduced motion the items show with the list, which was hidden: fade them in.
      'motion-reduce:data-visible:starting:opacity-0',
      'state-layer focus-ring',
      '[--m3-transition-property:width,opacity]',
      '[--m3-transition-duration:var(--md-sys-motion-spring-spatial-fast-duration),var(--md-sys-motion-spring-effects-fast-duration)]',
      '[--m3-transition-easing:var(--md-sys-motion-spring-spatial-fast-easing),var(--md-sys-motion-spring-effects-fast-easing)]',
      '[--m3-transition-delay:0s,0s]',
    ],
    // Natural-width content; the item clips it while its width animates.
    itemContent:
      'flex h-[56px] min-w-[56px] shrink-0 items-center justify-center gap-[8px] ps-[24px] pe-[24px] font-plain text-title-medium whitespace-nowrap',
    itemIcon: 'inline-flex size-[24px] shrink-0 items-center justify-center [&>svg]:size-full',
    // presentation="menu": a standard Menu 4px from the FAB, on whichever side it opened
    // (the menu list already cancels its own 8px shadow room with -8px).
    // The web menu's 4px gap comes from `offset` on the Menu; this slot is for consumers.
    menu: '',
  },
  variants: {
    color: colors,
    /** Like `Fab`: level 3 (the spec), level 1, or level 0 for a flat menu. */
    elevation: {
      default: { button: 'shadow-elevation-3', item: 'shadow-elevation-3' },
      lowered: { button: 'shadow-elevation-1', item: 'shadow-elevation-1' },
      flat: { button: 'shadow-elevation-0', item: 'shadow-elevation-0' },
    },
    size: {
      default: {
        anchor: 'size-[56px]',
        list: '-mb-[64px] pb-[64px]',
        button: 'size-[56px] rounded-corner-large',
        icon: 'size-[24px]',
      },
      medium: {
        anchor: 'size-[80px]',
        list: '-mb-[88px] pb-[88px]',
        button: 'size-[80px] rounded-corner-large-increased',
        icon: 'size-[28px]',
      },
      large: {
        anchor: 'size-[96px]',
        list: '-mb-[104px] pb-[104px]',
        button: 'size-[96px] rounded-corner-extra-large',
        icon: 'size-[32px]',
      },
    },
  },
  defaultVariants: { color: 'primary', elevation: 'default', size: 'default' },
});

export type FabMenuStyleProps = VariantProps<typeof fabMenuStyles>;
export type FabMenuColor = NonNullable<FabMenuStyleProps['color']>;
export type FabMenuSize = NonNullable<FabMenuStyleProps['size']>;
