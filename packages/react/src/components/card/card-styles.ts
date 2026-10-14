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
 * `surface` 38% over its container (`DisabledContainerOpacity`), the outlined border
 * `outline` 12%; content `on-surface` 38%.
 *
 * The resting container colour, corners, elevation and outline colour come from the card's
 * component tokens (`card-tokens.ts`, `--md-comp-<variant>-card-*`); the root carries
 * `data-tokens="md-comp-card"` and `data-variant`, and the classes read one private variable
 * per part. A consumer class (`bg-tertiary`, `rounded-corner-small`) still wins in `cn()`.
 *
 * Every class is written out in full so Tailwind can find it.
 */

/** Variant definitions for {@link Card}; extend them to add variants. */
export const cardStyles = tv({
  base: [
    'flex flex-col overflow-hidden text-on-surface',
    'rounded-[var(--_md-comp-card-container-shape)] bg-[var(--_md-comp-card-container-color)]',
    'shadow-[shadow:var(--_md-comp-card-container-elevation)]',
  ],
  variants: {
    variant: {
      filled: 'data-dragged:shadow-elevation-3',
      elevated: 'data-dragged:shadow-elevation-4',
      outlined:
        'border border-solid border-[color:var(--_md-comp-card-outline-color)] data-dragged:shadow-elevation-3',
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
        'data-disabled:bg-[color-mix(in_srgb,var(--md-sys-color-surface)_38%,var(--md-sys-color-surface-container-low))]',
        'data-disabled:shadow-elevation-1',
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
