import { tv, type VariantProps } from '../../utils/tv';

/*
 * Values follow Compose Material 3 (Tooltip.kt, BasicTooltip.kt, Plain / RichTooltipTokens):
 *
 * - Plain: `inverse-surface`, `body-small` `inverse-on-surface`, 8px × 4px padding, at least
 *   40×24px, at most 200px wide, 4px corners, no elevation.
 * - Rich: `surface-container` at level 2, 12px corners, 16px side padding, at most 320px
 *   wide. Subhead `title-small` with its first baseline 28px from the top; supporting text
 *   `body-medium` (both `on-surface-variant`) with its first baseline 24px below the subhead.
 *   Without a subhead the text starts 12px down, and without an action it ends 8px from the
 *   bottom (the spec's 12 / 8px padding); with an action it has 16px under it, and the action
 *   row is at least 36px tall with 8px under it.
 * - Both take their natural width (`w-max`) up to the maximum, so React Aria measures it and
 *   shifts the box inside the 8px screen margin rather than squeezing it against the edge; a
 *   rich tooltip never gets wider than the window less those margins.
 * - Both sit 4px from the anchor. They expand along the axis facing the anchor (a clip-path
 *   reveal from the anchor's side) on the fast spatial spring while fading on fast effects:
 *   the spec avoids scale motion. The clip rests 16px outside the box, so the shadow and the
 *   optional 16×8px caret show. Reduced motion keeps only the fade.
 *
 * The colours, corners and the rich tooltip's shadow come from the component tokens
 * (`tooltip-tokens.ts`, `--md-comp-plain-tooltip-*` and `--md-comp-rich-tooltip-*`); each
 * surface carries its set's `data-tokens`, and the parts read one private variable each. A
 * consumer class (`bg-primary`) still wins; a caret keeps the token colour unless
 * `classNames.caret` sets its own.
 *
 * Each tooltip is two boxes: a `positioner`, the outermost element, which React Aria places
 * (its inline `position`, `top` / `left` or `bottom` / `right`) and which takes the consumer's
 * `className`; and the `panel` inside it, the visible surface. A consumer inset (`bottom-4`)
 * would combine with React Aria's and stretch the positioner, so the positioner's
 * `data-overlay-placement` resets every inset React Aria leaves unset (styles/utilities.css);
 * the panel keeps its natural size either way. The panel is `relative` so the caret follows it.
 * The `root` slot is a deprecated alias of `panel` (the slot's earlier name), with exactly
 * its classes, kept for one release.
 *
 * Baselines are converted to padding from Roboto Flex metrics (the 20px line puts the
 * baseline ~15px down): subhead 13px, text 9px. Every class is written out in full so
 * Tailwind can find it.
 */

const motion = [
  'opacity-100 [clip-path:inset(-16px)]',
  '[transition-property:opacity,clip-path] motion-reduce:[transition-property:opacity]',
  '[transition-duration:var(--md-sys-motion-spring-effects-fast-duration),var(--md-sys-motion-spring-spatial-fast-duration)]',
  '[transition-timing-function:var(--md-sys-motion-spring-effects-fast-easing),var(--md-sys-motion-spring-spatial-fast-easing)]',
  'starting:opacity-0 data-exiting:opacity-0',
  // Expand from the anchor's side, along one axis.
  'data-[placement=top]:starting:[clip-path:inset(100%_-16px_-16px_-16px)] data-[placement=top]:data-exiting:[clip-path:inset(100%_-16px_-16px_-16px)]',
  'data-[placement=bottom]:starting:[clip-path:inset(-16px_-16px_100%_-16px)] data-[placement=bottom]:data-exiting:[clip-path:inset(-16px_-16px_100%_-16px)]',
  'data-[placement=left]:starting:[clip-path:inset(-16px_-16px_-16px_100%)] data-[placement=left]:data-exiting:[clip-path:inset(-16px_-16px_-16px_100%)]',
  'data-[placement=right]:starting:[clip-path:inset(-16px_100%_-16px_-16px)] data-[placement=right]:data-exiting:[clip-path:inset(-16px_100%_-16px_-16px)]',
];

const plainPanel = [
  'relative min-h-[24px] w-max min-w-[40px] max-w-[200px] px-[8px] py-[4px]',
  'rounded-[var(--_md-comp-plain-tooltip-container-shape)] bg-[var(--_md-comp-plain-tooltip-container-color)]',
  'font-plain text-body-small text-[color:var(--_md-comp-plain-tooltip-supporting-text-color)]',
  ...motion,
];

const richPanel = [
  'relative flex min-h-[24px] w-max min-w-[40px] max-w-[min(320px,100vw_-_16px)] flex-col px-[16px] outline-none',
  'rounded-[var(--_md-comp-rich-tooltip-container-shape)] bg-[var(--_md-comp-rich-tooltip-container-color)]',
  'font-plain text-[color:var(--_md-comp-rich-tooltip-supporting-text-color)]',
  'shadow-[shadow:var(--_md-comp-rich-tooltip-container-elevation)]',
  ...motion,
];

/** Variant definitions for {@link Tooltip}; extend them to add variants. */
export const tooltipStyles = tv({
  slots: {
    positioner: 'z-(--md-sys-z-tooltip)',
    panel: plainPanel,
    /** @deprecated Use `panel`; kept for one release. The same classes as `panel`. */
    root: plainPanel,
    caret: [
      'size-0 border-x-[8px] border-t-[8px] border-x-transparent',
      'border-t-[color:var(--_md-comp-plain-tooltip-container-color)]',
    ],
  },
});

/** Variant definitions for {@link RichTooltip}; extend them to add variants. */
export const richTooltipStyles = tv({
  slots: {
    positioner: 'z-(--md-sys-z-tooltip)',
    panel: richPanel,
    /** @deprecated Use `panel`; kept for one release. The same classes as `panel`. */
    root: richPanel,
    title: 'pt-[13px] text-title-small text-[color:var(--_md-comp-rich-tooltip-subhead-color)]',
    text: 'text-body-medium',
    actions: 'flex min-h-[36px] items-center pb-[8px]',
    caret: [
      'size-0 border-x-[8px] border-t-[8px] border-x-transparent',
      'border-t-[color:var(--_md-comp-rich-tooltip-container-color)]',
    ],
  },
  variants: {
    subhead: {
      // The text's first baseline 24px below the subhead's.
      true: { text: 'pt-[9px]' },
      false: { panel: 'pt-[12px]', root: 'pt-[12px]' },
    },
    action: {
      true: { text: 'pb-[16px]' },
      false: { panel: 'pb-[8px]', root: 'pb-[8px]' },
    },
  },
  defaultVariants: { subhead: false, action: false },
});

export type RichTooltipStyleProps = VariantProps<typeof richTooltipStyles>;
