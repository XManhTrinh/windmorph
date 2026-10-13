import { tv, type VariantProps } from '../../utils/tv';

/*
 * Values follow Compose Material 3 (Tooltip.kt, BasicTooltip.kt, Plain / RichTooltipTokens):
 *
 * - Plain: `inverse-surface`, `body-small` `inverse-on-surface`, 8px × 4px padding, at least
 *   40×24px, at most 200px wide, 4px corners, no elevation.
 * - Rich: `surface-container` at level 2, 12px corners, 16px side padding, at most 320px
 *   wide. Subhead `title-small` with its first baseline 28px from the top; supporting text
 *   `body-medium` (both `on-surface-variant`) with its first baseline 24px below the subhead
 *   and 16px below it; without a subhead or action the text has 4px above and below. The
 *   action row is at least 36px tall with 8px under it.
 * - Both sit 4px from the anchor and scale from 80% on the fast spatial spring while fading
 *   on fast effects; the optional caret is 16×8px.
 *
 * Baselines are converted to padding from Roboto Flex metrics (the 20px line puts the
 * baseline ~15px down): subhead 13px, text 9px. Every class is written out in full so
 * Tailwind can find it.
 */

const motion = [
  'opacity-100 scale-none',
  '[transition-property:opacity,scale]',
  '[transition-duration:var(--md-sys-motion-spring-effects-fast-duration),var(--md-sys-motion-spring-spatial-fast-duration)]',
  '[transition-timing-function:var(--md-sys-motion-spring-effects-fast-easing),var(--md-sys-motion-spring-spatial-fast-easing)]',
  'starting:scale-80 starting:opacity-0 data-exiting:scale-80 data-exiting:opacity-0',
  // Grow from the anchor's side.
  'data-[placement=top]:origin-bottom data-[placement=bottom]:origin-top data-[placement=left]:origin-right data-[placement=right]:origin-left',
];

/** Variant definitions for {@link Tooltip}; extend them to add variants. */
export const tooltipStyles = tv({
  slots: {
    root: [
      'z-(--md-sys-z-tooltip) min-h-[24px] min-w-[40px] max-w-[200px] px-[8px] py-[4px]',
      'rounded-corner-extra-small bg-inverse-surface font-plain text-body-small text-inverse-on-surface',
      ...motion,
    ],
    caret: 'size-0 border-x-[8px] border-t-[8px] border-x-transparent border-t-inverse-surface',
  },
});

/** Variant definitions for {@link RichTooltip}; extend them to add variants. */
export const richTooltipStyles = tv({
  slots: {
    root: [
      'z-(--md-sys-z-tooltip) flex min-h-[24px] min-w-[40px] max-w-[320px] flex-col px-[16px] outline-none',
      'rounded-corner-medium bg-surface-container font-plain text-on-surface-variant shadow-elevation-2',
      ...motion,
    ],
    title: 'pt-[13px] text-title-small text-on-surface-variant',
    text: 'text-body-medium',
    actions: 'flex min-h-[36px] items-center pb-[8px]',
    caret: 'size-0 border-x-[8px] border-t-[8px] border-x-transparent border-t-surface-container',
  },
  variants: {
    spaced: {
      // With a subhead or an action: first baseline 24px down, 16px under the text.
      true: { text: 'pt-[9px] pb-[16px]' },
      false: { text: 'py-[4px]' },
    },
  },
  defaultVariants: { spaced: false },
});

export type RichTooltipStyleProps = VariantProps<typeof richTooltipStyles>;
