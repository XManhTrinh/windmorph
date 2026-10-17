import { tv, type VariantProps } from '../../utils/tv';

/*
 * Values follow Compose Material 3 (LoadingIndicator.kt, LoadingIndicatorTokens): a 48px
 * box with full corners; the indicator is `primary`, or `on-primary-container` on a
 * `primary-container` container when contained. The SVG scales with the box, keeping a
 * square aspect. The colours come from the component tokens (`loading-indicator-tokens.ts`,
 * `--md-comp-loading-indicator-[contained-]*`); the root carries
 * `data-tokens="md-comp-loading-indicator"` and `data-variant`, and reads one private variable
 * per part. A consumer class (`text-tertiary`) still wins. Every class is written out in full so Tailwind can find it.
 */

/** Variant definitions for {@link LoadingIndicator}; extend them to add variants. */
export const loadingIndicatorStyles = tv({
  slots: {
    // 48px by default; `size` sets --m3-loading-indicator-size (24–240px, the spec's range).
    root: [
      'inline-flex size-(--m3-loading-indicator-size,48px) shrink-0 items-center justify-center rounded-corner-full',
      'bg-[var(--_md-comp-loading-indicator-container-color)]',
      'text-[color:var(--_md-comp-loading-indicator-active-indicator-color)]',
    ],
    indicator: 'size-full fill-current',
  },
  variants: {
    variant: {
      default: {},
      contained: {},
    },
  },
  defaultVariants: { variant: 'default' },
});

/**
 * The variants of {@link loadingIndicatorStyles}, for building on its styles. They are the recipe's keys, not
 * component props: their names (`hasIcon`, `isOpen`…) follow the classes and may change.
 */
export type LoadingIndicatorStyleProps = VariantProps<typeof loadingIndicatorStyles>;
export type LoadingIndicatorVariant = NonNullable<LoadingIndicatorStyleProps['variant']>;
