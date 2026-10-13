import { tv, type VariantProps } from '../../utils/tv';

/*
 * Values follow Compose Material 3 (LoadingIndicator.kt, LoadingIndicatorTokens): a 48px
 * box with full corners; the indicator is `primary`, or `on-primary-container` on a
 * `primary-container` container when contained. The SVG scales with the box, keeping a
 * square aspect. Every class is written out in full so Tailwind can find it.
 */

/** Variant definitions for {@link LoadingIndicator}; extend them to add variants. */
export const loadingIndicatorStyles = tv({
  slots: {
    // 48px by default; `size` sets --m3-loading-indicator-size (24–240px, the spec's range).
    root: 'inline-flex size-(--m3-loading-indicator-size,48px) shrink-0 items-center justify-center rounded-corner-full',
    indicator: 'size-full fill-current',
  },
  variants: {
    variant: {
      default: { root: 'text-primary' },
      contained: { root: 'bg-primary-container text-on-primary-container' },
    },
  },
  defaultVariants: { variant: 'default' },
});

export type LoadingIndicatorStyleProps = VariantProps<typeof loadingIndicatorStyles>;
export type LoadingIndicatorVariant = NonNullable<LoadingIndicatorStyleProps['variant']>;
