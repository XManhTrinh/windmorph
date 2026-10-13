import { tv, type VariantProps } from '../../utils/tv';

/*
 * Values follow Compose Material 3 (FloatingActionButtonMenu.kt, FabMenuBaselineTokens):
 *
 * - The toggle button keeps its FAB's layout box (56 / 80 / 96px) and, when open, shrinks to
 *   the 56px close button with full corners and a 20px icon, its container going from the
 *   `*-container` role to the vibrant role. Size, corners, colours and icon all follow one
 *   fast spatial spring, as Compose's single `checkedProgress` does. Elevation is level 3.
 * - Items are 56px pills (min width 56px, 24px side padding, 8px icon gap, 24px icon,
 *   `title-medium`) 4px apart, 8px above the button. Compose's item Surface sets no
 *   elevation (the token's level 3 is unused). Item width springs on fast spatial and
 *   opacity on fast effects.
 *
 * Colour styles are m3.material.io's primary / secondary / tertiary sets; Compose's
 * defaults are the primary set. Every class is written out in full so Tailwind can find it.
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
    root: 'inline-flex flex-col-reverse gap-[8px]',
    // Library-owned box that keeps the FAB's size while the button shrinks inside it.
    anchor: 'inline-flex shrink-0 items-start',
    button: [
      'group/fab-menu inline-flex shrink-0 cursor-pointer items-center justify-center select-none',
      'shadow-elevation-3 state-layer focus-ring',
      // Open: the 56px close button, its corners half its size (a literal, so they interpolate).
      'data-open:size-[56px] data-open:rounded-[28px]',
      '[--m3-transition-property:width,height,border-radius,background-color,color]',
      '[--m3-transition-duration:var(--md-sys-motion-spring-spatial-fast-duration),var(--md-sys-motion-spring-spatial-fast-duration),var(--md-sys-motion-spring-spatial-fast-duration),var(--md-sys-motion-spring-spatial-fast-duration),var(--md-sys-motion-spring-spatial-fast-duration)]',
      '[--m3-transition-easing:var(--md-sys-motion-spring-spatial-fast-easing),var(--md-sys-motion-spring-spatial-fast-easing),var(--md-sys-motion-spring-spatial-fast-easing),var(--md-sys-motion-spring-spatial-fast-easing),var(--md-sys-motion-spring-spatial-fast-easing)]',
      '[--m3-transition-delay:0s,0s,0s,0s,0s]',
    ],
    icon: [
      'inline-flex shrink-0 items-center justify-center [&>svg]:size-full',
      'group-data-open/fab-menu:size-[20px]',
      '[transition-property:width,height]',
      '[transition-duration:var(--md-sys-motion-spring-spatial-fast-duration)]',
      '[transition-timing-function:var(--md-sys-motion-spring-spatial-fast-easing)]',
    ],
    list: 'flex flex-col gap-[4px]',
    item: [
      'flex h-[56px] shrink-0 cursor-pointer overflow-hidden rounded-corner-full select-none',
      'opacity-0 data-visible:opacity-100',
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
  },
  variants: {
    color: colors,
    size: {
      default: {
        anchor: 'size-[56px]',
        button: 'size-[56px] rounded-corner-large',
        icon: 'size-[24px]',
      },
      medium: {
        anchor: 'size-[80px]',
        button: 'size-[80px] rounded-corner-large-increased',
        icon: 'size-[28px]',
      },
      large: {
        anchor: 'size-[96px]',
        button: 'size-[96px] rounded-corner-extra-large',
        icon: 'size-[36px]',
      },
    },
    align: {
      start: {
        root: 'items-start',
        anchor: 'justify-start',
        list: 'items-start',
        item: 'justify-start',
      },
      center: {
        root: 'items-center',
        anchor: 'justify-center',
        list: 'items-center',
        item: 'justify-center',
      },
      end: { root: 'items-end', anchor: 'justify-end', list: 'items-end', item: 'justify-end' },
    },
  },
  defaultVariants: { color: 'primary', size: 'default', align: 'end' },
});

export type FabMenuStyleProps = VariantProps<typeof fabMenuStyles>;
export type FabMenuColor = NonNullable<FabMenuStyleProps['color']>;
export type FabMenuSize = NonNullable<FabMenuStyleProps['size']>;
export type FabMenuAlign = NonNullable<FabMenuStyleProps['align']>;
