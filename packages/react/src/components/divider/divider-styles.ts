import { tv, type VariantProps } from '../../utils/tv';

/*
 * Values follow Compose Material 3 (Divider.kt, DividerTokens): 1px of `outline-variant`.
 * Insets follow m3.material.io (16px at the start, or at both ends for a middle inset);
 * Compose leaves them to padding. The line is the element's background clipped to its
 * content box, so the inset is padding and the root keeps no margins (§10).
 * Every class is written out in full so Tailwind can find it.
 */

/** Variant definitions for {@link Divider}; extend them to add variants. */
export const dividerStyles = tv({
  base: 'm-0 shrink-0 border-0 bg-outline-variant bg-clip-content',
  variants: {
    orientation: {
      horizontal: 'h-px w-full',
      vertical: 'w-px self-stretch',
    },
    inset: { none: '', start: '', middle: '' },
  },
  compoundVariants: [
    { orientation: 'horizontal', inset: 'start', class: 'ps-[16px]' },
    { orientation: 'horizontal', inset: 'middle', class: 'ps-[16px] pe-[16px]' },
    { orientation: 'vertical', inset: 'start', class: 'pt-[16px]' },
    { orientation: 'vertical', inset: 'middle', class: 'pt-[16px] pb-[16px]' },
  ],
  defaultVariants: { orientation: 'horizontal', inset: 'none' },
});

/**
 * Variant definitions for {@link LabeledDivider}: a divider with supporting text 4px below
 * it, 8px clear at the end and below (m3.material.io's divider measurements). The spec
 * names no type role for the text; it uses `label-small` in `on-surface-variant`.
 */
export const labeledDividerStyles = tv({
  slots: {
    root: 'flex min-w-0 flex-col gap-[4px] pe-[8px] pb-[8px]',
    label: 'text-label-small text-on-surface-variant',
  },
  variants: {
    inset: {
      none: {},
      start: { label: 'ps-[16px]' },
      middle: { label: 'ps-[16px] pe-[16px]' },
    },
  },
  defaultVariants: { inset: 'none' },
});

export type DividerStyleProps = VariantProps<typeof dividerStyles>;
export type DividerOrientation = NonNullable<DividerStyleProps['orientation']>;
export type DividerInset = NonNullable<DividerStyleProps['inset']>;
