import { tv, type VariantProps } from '../../utils/tv';

/*
 * Values follow Compose Material 3 (carousel/Carousel.kt, Keylines.kt and CarouselDefaults):
 * small items 40–56px, 10px anchors, single-item snapping for multi-browse and hero (none
 * for uncontained). Items are masked with 28px (extra-large) corners, as Compose's samples
 * do with `maskClip(MaterialTheme.shapes.extraLarge)`; `--m3-carousel-corner` overrides it.
 * Spacing defaults to 8px (m3.material.io; Compose's default is 0 and its samples use 8dp).
 *
 * The carousel scrolls natively. Items keep their natural slots (the large item size), and
 * a library-owned mask layer inside each is translated and clipped to its keyline on every
 * scroll frame, so the root is never transformed. Every class is written out in full.
 */

/** Variant definitions for {@link Carousel}. */
export const carouselStyles = tv({
  slots: {
    root: 'flex min-h-0 min-w-0 [--m3-carousel-corner:var(--md-sys-shape-corner-extra-large)]',
    scroller: [
      'flex min-h-0 min-w-0 flex-1 overscroll-contain outline-none [scrollbar-width:none]',
      'focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-secondary focus-visible:outline-solid',
      'data-dragging:cursor-grabbing data-dragging:[scroll-snap-type:none] data-dragging:select-none',
      '[&::-webkit-scrollbar]:hidden',
    ],
    item: 'flex shrink-0',
    mask: 'size-full overflow-hidden [&>*]:size-full',
  },
  variants: {
    orientation: {
      horizontal: { scroller: 'flex-row overflow-x-auto overflow-y-hidden', item: 'h-full' },
      vertical: { scroller: 'flex-col overflow-x-hidden overflow-y-auto', item: 'w-full' },
    },
    snapping: { single: {}, none: {} },
  },
  compoundVariants: [
    {
      snapping: 'single',
      orientation: 'horizontal',
      class: { scroller: 'snap-x snap-mandatory', item: 'snap-start snap-always' },
    },
    {
      snapping: 'single',
      orientation: 'vertical',
      class: { scroller: 'snap-y snap-mandatory', item: 'snap-start snap-always' },
    },
  ],
  defaultVariants: { orientation: 'horizontal', snapping: 'single' },
});

export type CarouselStyleProps = VariantProps<typeof carouselStyles>;
