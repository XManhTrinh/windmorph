import { tv, type VariantProps } from '../../utils/tv';

/*
 * Values follow Compose Material 3 (ProgressIndicator.kt, WavyProgressIndicator.kt and the
 * ProgressIndicator / Linear / Circular tokens): `primary` active indicator and stop dot on
 * a `secondary-container` track, 4px round strokes and a 4px gap. Linear: 240px wide, 4px
 * tall (10px when wavy). Circular: 40px (48px when wavy). The SVG is mirrored in RTL.
 * Every class is written out in full so Tailwind can find it.
 */

/** Variant definitions for {@link LinearProgressIndicator}; extend them to add variants. */
export const linearProgressStyles = tv({
  slots: {
    root: 'block w-[240px] max-w-full shrink-0',
    svg: 'block size-full overflow-visible rtl:-scale-x-100',
    track: 'fill-none stroke-secondary-container stroke-[4px] [stroke-linecap:round]',
    indicator:
      'fill-none stroke-primary stroke-[4px] [stroke-linecap:round] [stroke-linejoin:round]',
    stop: 'fill-primary',
  },
  variants: {
    wavy: { true: { root: 'h-[10px]' }, false: { root: 'h-[4px]' } },
  },
  defaultVariants: { wavy: false },
});

/** Variant definitions for {@link CircularProgressIndicator}; extend them to add variants. */
export const circularProgressStyles = tv({
  slots: {
    root: 'inline-block shrink-0',
    svg: 'block size-full overflow-visible rtl:-scale-x-100',
    track: 'fill-none stroke-secondary-container stroke-[4px] [stroke-linecap:round]',
    indicator:
      'fill-none stroke-primary stroke-[4px] [stroke-linecap:round] [stroke-linejoin:round]',
  },
  variants: {
    wavy: { true: { root: 'size-[48px]' }, false: { root: 'size-[40px]' } },
  },
  defaultVariants: { wavy: false },
});

export type LinearProgressStyleProps = VariantProps<typeof linearProgressStyles>;
export type CircularProgressStyleProps = VariantProps<typeof circularProgressStyles>;
