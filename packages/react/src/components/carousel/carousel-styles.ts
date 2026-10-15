import { tv, type VariantProps } from '../../utils/tv';

/*
 * Values follow the M3 Expressive carousel spec (2026-10-13) and Compose Material 3
 * (carousel/Carousel.kt, Keylines.kt, Strategy.kt):
 *
 * - Multi-browse and hero: 16px leading and trailing padding, 8px top and bottom, 8px
 *   between items. Uncontained (and multi-aspect): 16px leading padding only. Full-screen:
 *   no padding, 16px between items and no corners. Small items are 40–56px.
 * - Snapping: hero and full-screen move one item at a time (`scroll-snap-stop: always`);
 *   multi-browse flings across many items and then snaps; uncontained and multi-aspect
 *   scroll freely unless `snap="item"`.
 * - Uncontained (and multi-aspect) items keep one size and flow past the end edge; only
 *   multi-browse and hero items follow keylines.
 * - Each item's mask is filled with `surface`, the spec's container colour, so transparent
 *   or still-loading content never shows what's behind the carousel.
 * - Items are masked with 28px (extra-large) corners, as Compose's samples do with
 *   `maskClip(MaterialTheme.shapes.extraLarge)`; the component token
 *   `--md-comp-carousel-item-container-shape` (`carousel-tokens.ts`) sets them. A
 *   pressed item's corners tighten to `--m3-carousel-pressed-corner` (20px, large-increased)
 *   on the fast spatial spring, the spec's "changes the shape slightly".
 *
 * The carousel scrolls natively. Items keep their natural slots (the large item size), and
 * a library-owned mask layer inside each is translated and clipped to its keyline on every
 * scroll frame, so the root is never transformed. The state layer is a library-owned
 * element sharing the mask's grid cell, painted over the item (nothing is positioned).
 * Under the mask, a press area follows it, widened to 48px for a small item (40–56px):
 * M3's touch target, taken from the 8px spacing, so neighbours never overlap.
 * Every class is written out in full.
 */

/** Variant definitions for {@link Carousel}. */
export const carouselStyles = tv({
  slots: {
    root: [
      'flex min-h-0 min-w-0',
      '[--m3-carousel-corner:var(--_md-comp-carousel-item-container-shape)]',
      '[--m3-carousel-pressed-corner:var(--md-sys-shape-corner-large-increased)]',
    ],
    scroller: [
      'flex min-h-0 min-w-0 flex-1 overscroll-contain outline-none [scrollbar-width:none]',
      'data-dragging:cursor-grabbing data-dragging:[scroll-snap-type:none] data-dragging:select-none',
      '[&::-webkit-scrollbar]:hidden',
    ],
    item: 'flex shrink-0 rounded-(--m3-carousel-corner)',
    mask: [
      'grid size-full overflow-hidden bg-surface [&>*]:[grid-area:1/1] [&>*]:size-full',
      '[--m3-carousel-item-corner:var(--m3-carousel-corner)]',
      'data-pressed:[--m3-carousel-item-corner:var(--m3-carousel-pressed-corner)]',
      '[transition-property:--m3-carousel-item-corner]',
      '[transition-duration:var(--md-sys-motion-spring-spatial-fast-duration)]',
      '[transition-timing-function:var(--md-sys-motion-spring-spatial-fast-easing)]',
      'motion-reduce:[transition-duration:0s]',
      'data-disabled:opacity-38',
    ],
    stateLayer:
      'pointer-events-none state-layer [--m3-state-layer-color:var(--md-sys-color-on-surface)]',
    // The item's press area, laid under the mask in the same place (a negative end margin,
    // so nothing is positioned).
    hitArea: 'h-full w-full shrink-0 -me-[100%]',
  },
  variants: {
    orientation: {
      horizontal: { scroller: 'flex-row overflow-x-auto overflow-y-hidden', item: 'h-full' },
      vertical: { scroller: 'flex-col overflow-x-hidden overflow-y-auto', item: 'w-full' },
    },
    /** `single` stops at every item, `many` lets a fling cross several, `none` doesn't snap. */
    snapping: { single: {}, many: {}, none: {} },
    /** The mask is clipped by the keylines on every scroll frame; otherwise by CSS. */
    masked: {
      // Only the mask and the press area under it take presses, not the rest of the slot, so
      // a press between items never lands on an item whose slot reaches there.
      true: {
        item: 'pointer-events-none',
        mask: 'pointer-events-auto',
        hitArea: 'pointer-events-auto',
      },
      false: { mask: '[clip-path:inset(0_round_var(--m3-carousel-item-corner))]' },
    },
    /** Multi-aspect items keep their own width, between 9:16 and 16:9 of the height. */
    aspect: {
      true: {
        item: [
          'w-max min-w-[calc(var(--m3-carousel-cross-size)*9/16)]',
          'max-w-[calc(var(--m3-carousel-cross-size)*16/9)]',
        ],
        mask: '[&>*]:h-full [&>*]:w-auto [&>*]:min-w-full [&>*]:max-w-full [&>*]:object-cover',
      },
      false: {},
    },
    interactive: { true: { item: 'cursor-pointer data-disabled:cursor-default' }, false: {} },
    /** Full-bleed items fill the window edge to edge: no corners, focus ring inside. */
    fullBleed: {
      true: {
        root: '[--m3-carousel-corner:0px] [--m3-carousel-pressed-corner:0px]',
        item: 'focus-ring-inset',
      },
      false: { item: 'focus-ring' },
    },
  },
  compoundVariants: [
    {
      snapping: ['single', 'many'],
      orientation: 'horizontal',
      class: { scroller: 'snap-x snap-mandatory', item: 'snap-start' },
    },
    {
      snapping: ['single', 'many'],
      orientation: 'vertical',
      class: { scroller: 'snap-y snap-mandatory', item: 'snap-start' },
    },
    { snapping: 'single', class: { item: 'snap-always' } },
  ],
  defaultVariants: {
    orientation: 'horizontal',
    snapping: 'single',
    masked: true,
    aspect: false,
    interactive: false,
    fullBleed: false,
  },
});

export type CarouselStyleProps = VariantProps<typeof carouselStyles>;
