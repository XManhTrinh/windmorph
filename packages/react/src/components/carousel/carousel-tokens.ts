import { corner, defineComponentTokens } from '../../tokens/component';

/*
 * The carousel's component token, M3's `md.comp.carousel-item.container.shape` (checked
 * against m3.material.io's token tables, 2026-10-14): the corners each item is masked with,
 * 28px (extra-large) as Compose's samples mask them. The root carries
 * `data-tokens="md-comp-carousel"` and `data-variant`; the internal `--m3-carousel-corner`
 * takes the token, so the registered `--m3-carousel-item-corner` still animates a pressed
 * item's corners. The pressed corners and the full-screen variant's square items stay fixed.
 */

/** The tokens of {@link Carousel}. */
export const carouselTokenSet = defineComponentTokens({
  name: 'md-comp-carousel',
  tokens: {
    'item-container-shape': {
      value: corner('extra-large'),
      description: "Each item's corners (not the full-screen variant's, which are square).",
      paints: { property: 'border-top-left-radius', slot: 'item' },
    },
  },
});
