import { tv, type VariantProps } from '../../utils/tv';

/*
 * Values follow the M3 card spec's states (m3.material.io: enabled, disabled, hovered,
 * focused, pressed, dragged) with the elevations and colours of Compose's *CardTokens
 * (2026-10-13). Content is `on-surface`.
 *
 * Elevation (rest / hover / focus and press / dragged): filled 0 / 1 / 0 / 3, elevated
 * 1 / 2 / 1 / 4, outlined 0 / 1 / 0 / 3. Hover applies only while the card isn't pressed,
 * keyboard-focused or dragged, so one rule wins at a time. A focused outlined card's border
 * is `on-surface`. Disabled: filled `surface-variant` 38% over its container, elevated
 * `surface`, the outlined border `outline` 12%; content `on-surface` 38%.
 *
 * Every class is written out in full so Tailwind can find it.
 */

/** Variant definitions for {@link Card}; extend them to add variants. */
export const cardStyles = tv({
  base: 'flex flex-col overflow-hidden rounded-corner-medium text-on-surface',
  variants: {
    variant: {
      filled: 'bg-surface-container-highest shadow-elevation-0 data-dragged:shadow-elevation-3',
      elevated: 'bg-surface-container-low shadow-elevation-1 data-dragged:shadow-elevation-4',
      outlined:
        'border border-solid border-outline-variant bg-surface shadow-elevation-0 data-dragged:shadow-elevation-3',
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
        'data-hovered:not-data-pressed:not-data-focus-visible:not-data-dragged:shadow-elevation-1',
        'data-disabled:bg-[color-mix(in_srgb,var(--md-sys-color-surface-variant)_38%,var(--md-sys-color-surface-container-highest))]',
        'data-disabled:shadow-elevation-0',
      ],
    },
    {
      variant: 'elevated',
      interactive: true,
      class: [
        'data-hovered:not-data-pressed:not-data-focus-visible:not-data-dragged:shadow-elevation-2',
        'data-disabled:bg-surface data-disabled:shadow-elevation-1',
      ],
    },
    {
      variant: 'outlined',
      interactive: true,
      class: [
        'data-hovered:not-data-pressed:not-data-focus-visible:not-data-dragged:shadow-elevation-1',
        'data-focus-visible:border-on-surface',
        'data-disabled:border-outline/12 data-disabled:shadow-elevation-0',
      ],
    },
  ],
  defaultVariants: { variant: 'filled', interactive: false },
});

export type CardStyleProps = VariantProps<typeof cardStyles>;
export type CardVariant = NonNullable<CardStyleProps['variant']>;
