import { tv, type VariantProps } from '../../utils/tv';

/*
 * Values follow Compose Material 3 (ProgressIndicator.kt, WavyProgressIndicator.kt and the
 * ProgressIndicator / Linear / Circular tokens): `primary` active indicator and stop dot on
 * a `secondary-container` track, round strokes and a 4px gap. The stroke widths come from the
 * `thickness` props (4px by default) as SVG attributes, and the box from them: the linear
 * height and circular size are the `--m3-progress-height` / `--m3-progress-size` variables
 * the component sets (linear 4px, 10px wavy; circular 40px, 48px wavy, at 4px). Only the
 * linear indicator mirrors in RTL; the spec keeps circular indicators clockwise.
 *
 * The colours come from the component tokens (`progress-tokens.ts`,
 * `--md-comp-progress-indicator-*`); each root carries
 * `data-tokens="md-comp-progress-indicator"`, and the parts read one private variable each. A
 * consumer class (`stroke-current`) still wins.
 *
 * Forced colours (2026-10-15): browsers don't force SVG strokes, so they kept the theme's
 * colours (a 1.2:1 track on a white high-contrast canvas). There the indicator and stop dot
 * are `CanvasText` and the track `GrayText`.
 * Every class is written out in full so Tailwind can find it.
 */

/** Variant definitions for {@link LinearProgressIndicator}; extend them to add variants. */
export const linearProgressStyles = tv({
  slots: {
    root: 'block h-(--m3-progress-height) w-[240px] max-w-full shrink-0',
    svg: 'block size-full overflow-visible rtl:-scale-x-100',
    track: [
      'fill-none stroke-[var(--_md-comp-progress-indicator-track-color)] [stroke-linecap:round]',
      'forced-colors:stroke-[GrayText]',
    ],
    indicator: [
      'fill-none stroke-[var(--_md-comp-progress-indicator-active-indicator-color)]',
      'forced-colors:stroke-[CanvasText]',
      '[stroke-linecap:round] [stroke-linejoin:round]',
    ],
    stop: 'fill-[var(--_md-comp-progress-indicator-stop-indicator-color)] forced-colors:fill-[CanvasText]',
  },
  variants: {
    wavy: { true: {}, false: {} },
  },
  defaultVariants: { wavy: false },
});

/** Variant definitions for {@link CircularProgressIndicator}; extend them to add variants. */
export const circularProgressStyles = tv({
  slots: {
    root: 'inline-block size-(--m3-progress-size) shrink-0',
    svg: 'block size-full overflow-visible',
    track: [
      'fill-none stroke-[var(--_md-comp-progress-indicator-track-color)] [stroke-linecap:round]',
      'forced-colors:stroke-[GrayText]',
    ],
    indicator: [
      'fill-none stroke-[var(--_md-comp-progress-indicator-active-indicator-color)]',
      'forced-colors:stroke-[CanvasText]',
      '[stroke-linecap:round] [stroke-linejoin:round]',
    ],
  },
  variants: {
    wavy: { true: {}, false: {} },
  },
  defaultVariants: { wavy: false },
});

/**
 * The variants of {@link linearProgressStyles}, for building on its styles. They are the recipe's keys, not
 * component props: their names (`hasIcon`, `isOpen`…) follow the classes and may change.
 */
export type LinearProgressStyleProps = VariantProps<typeof linearProgressStyles>;
/**
 * The variants of {@link circularProgressStyles}, for building on its styles. They are the recipe's keys, not
 * component props: their names (`hasIcon`, `isOpen`…) follow the classes and may change.
 */
export type CircularProgressStyleProps = VariantProps<typeof circularProgressStyles>;
