import { tv, type VariantProps } from '../../utils/tv';

/*
 * Values follow Compose Material 3 (Card.kt and the *CardTokens files). Content is
 * `on-surface`. Interactive cards raise on hover (filled 0→1, elevated 1→2) and when
 * dragged; outlined cards keep their elevation on hover, which Compose's code sets
 * despite its token. Disabled colours are Compose's composites ("A at n% over B").
 * Every class is written out in full so Tailwind can find it.
 */

/** Variant definitions for {@link Card}; extend them to add variants. */
export const cardStyles = tv({
  base: 'flex flex-col overflow-hidden rounded-corner-medium text-on-surface',
  variants: {
    variant: {
      filled: 'bg-surface-container-highest shadow-elevation-0',
      elevated: 'bg-surface-container-low shadow-elevation-1',
      outlined: 'border border-solid border-outline-variant bg-surface shadow-elevation-0',
    },
    interactive: {
      true: [
        'w-full cursor-pointer text-start select-none',
        'state-layer focus-ring container-motion',
        'data-disabled:cursor-default data-disabled:text-on-surface/38',
      ],
      false: '',
    },
  },
  compoundVariants: [
    {
      variant: 'filled',
      interactive: true,
      class: [
        'data-hovered:shadow-elevation-1 data-dragged:shadow-elevation-3',
        'data-disabled:bg-[color-mix(in_srgb,var(--md-sys-color-surface-variant)_38%,var(--md-sys-color-surface-container-highest))]',
        'data-disabled:shadow-elevation-0',
      ],
    },
    {
      variant: 'elevated',
      interactive: true,
      class:
        'data-hovered:shadow-elevation-2 data-dragged:shadow-elevation-4 data-disabled:bg-surface data-disabled:shadow-elevation-1',
    },
    {
      variant: 'outlined',
      interactive: true,
      class: [
        'data-dragged:shadow-elevation-3',
        'data-disabled:border-[color-mix(in_srgb,var(--md-sys-color-outline)_12%,var(--md-sys-color-surface-container-low))]',
      ],
    },
  ],
  defaultVariants: { variant: 'filled', interactive: false },
});

export type CardStyleProps = VariantProps<typeof cardStyles>;
export type CardVariant = NonNullable<CardStyleProps['variant']>;
