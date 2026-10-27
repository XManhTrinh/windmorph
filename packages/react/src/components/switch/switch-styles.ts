import { selectionControlStyles } from '../../primitives/selection-control-styles';
import { tv, type VariantProps } from '../../utils/tv';

/*
 * Values follow Compose Material 3 (Switch.kt and SwitchTokens): a 52×32px track with a
 * 2px outline; the thumb is 16px (off), 24px (on, or with an icon) and 28px (pressed),
 * centred 16px or 36px from the track's start. Pressing (or dragging) snaps the
 * thumb; releasing animates it on the fast spatial spring. The 40px state layer
 * follows the thumb. Web density (`--md-sys-density`) takes 4px a step off the state layer,
 * to 32px at -2 and -3 so it still rings a pressed 28px thumb (Material Components Web's
 * switch density shrinks only the state layer, 48 → 28px, never the track).
 * Disabled colours are Compose's composites over `surface`. `--m3-thumb-size` and
 * `--m3-thumb-center` are set by the component. The resting track, outline, handle and icon
 * colours come from the switch's component tokens (`switch-tokens.ts`, `--md-comp-switch-*`);
 * a consumer class (`classNames.control`, `classNames.thumb`) still wins in `cn()`. Every
 * class is written out in full.
 */

const thumbMotion =
  '[transition-duration:var(--md-sys-motion-spring-spatial-fast-duration),var(--md-sys-motion-spring-spatial-fast-duration),var(--md-sys-motion-spring-spatial-fast-duration),var(--md-sys-motion-spring-spatial-fast-duration),var(--md-sys-motion-spring-effects-default-duration)] [transition-timing-function:var(--md-sys-motion-spring-spatial-fast-easing),var(--md-sys-motion-spring-spatial-fast-easing),var(--md-sys-motion-spring-spatial-fast-easing),var(--md-sys-motion-spring-spatial-fast-easing),var(--md-sys-motion-spring-effects-default-easing)]';

/** Variant definitions for {@link Switch}. */
export const switchStyles = tv({
  extend: selectionControlStyles,
  slots: {
    // The control is the track.
    control: [
      'h-[32px] w-[52px] border-2 border-solid',
      'border-[color:var(--_md-comp-switch-unselected-track-outline-color)]',
      'bg-[var(--_md-comp-switch-unselected-track-color)]',
      // The thumb can be dragged sideways; vertical swipes still scroll the page.
      'touch-pan-y',
      '[transition-property:background-color,border-color]',
      '[transition-duration:var(--md-sys-motion-spring-effects-default-duration)]',
      '[transition-timing-function:var(--md-sys-motion-spring-effects-default-easing)]',
      'control-checked:border-[color:var(--_md-comp-switch-selected-track-color)]',
      'control-checked:bg-[var(--_md-comp-switch-selected-track-color)]',
      'group-data-disabled/control:border-[color-mix(in_srgb,var(--md-sys-color-on-surface)_12%,var(--md-sys-color-surface))]',
      'group-data-disabled/control:bg-[color-mix(in_srgb,var(--md-sys-color-surface-container-highest)_12%,var(--md-sys-color-surface))]',
      'group-data-disabled/control:control-checked:border-transparent',
      'group-data-disabled/control:control-checked:bg-[color-mix(in_srgb,var(--md-sys-color-on-surface)_12%,var(--md-sys-color-surface))]',
      // Forced colours: the thumb is a background, which forced colours drop, so the track and
      // thumb take system colours: an outlined `Canvas` track with a `CanvasText` thumb when
      // off, a `Highlight` track with a `HighlightText` thumb when on, `GrayText` when disabled.
      'forced-colors:forced-color-adjust-none forced-colors:border-[CanvasText]! forced-colors:bg-[Canvas]!',
      'forced-colors:control-checked:border-[Highlight]! forced-colors:control-checked:bg-[Highlight]!',
      'forced-colors:group-data-disabled/control:border-[GrayText]!',
      'forced-colors:group-data-disabled/control:control-checked:border-[GrayText]! forced-colors:group-data-disabled/control:control-checked:bg-[GrayText]!',
    ],
    stateLayer: [
      // 40px, 4px less per density step down to 32px (`--m3-switch-layer`), centred on the
      // thumb: the track's 2px border is outside the positioning box.
      '[--m3-switch-layer:max(32px,calc(40px+var(--md-sys-density,0)*4px))]',
      'pointer-events-none absolute top-[calc(14px-var(--m3-switch-layer)/2)] start-[calc(var(--m3-thumb-center)-2px-var(--m3-switch-layer)/2)] size-[var(--m3-switch-layer)] rounded-full',
      'state-layer [--m3-ripple-size:calc(var(--m3-switch-layer)/2)] [--m3-ripple-start:calc(var(--m3-switch-layer)*0.3)]',
      '[--m3-state-layer-color:var(--md-sys-color-on-surface)]',
      'data-checked:[--m3-state-layer-color:var(--md-sys-color-primary)]',
      '[--m3-transition-property:inset-inline-start]',
      '[--m3-transition-duration:var(--md-sys-motion-spring-spatial-fast-duration)]',
      '[--m3-transition-easing:var(--md-sys-motion-spring-spatial-fast-easing)]',
      '[--m3-transition-delay:0s]',
    ],
    thumb: [
      'absolute top-[calc(14px-var(--m3-thumb-size)/2)] start-[calc(var(--m3-thumb-center)-var(--m3-thumb-size)/2-2px)]',
      'flex size-[var(--m3-thumb-size)] items-center justify-center rounded-full',
      'bg-[var(--_md-comp-switch-unselected-handle-color)] text-[color:var(--_md-comp-switch-unselected-icon-color)]',
      '[transition-property:width,height,top,inset-inline-start,background-color]',
      thumbMotion,
      'group-data-pressed/control:[transition-duration:0s,0s,0s,0s,var(--md-sys-motion-spring-effects-default-duration)]',
      'group-data-hovered/control:bg-on-surface-variant',
      'group-data-focus-visible/control:bg-on-surface-variant',
      'group-data-pressed/control:bg-on-surface-variant',
      'control-checked:bg-[var(--_md-comp-switch-selected-handle-color)]',
      'control-checked:text-[color:var(--_md-comp-switch-selected-icon-color)]',
      'control-checked:group-data-hovered/control:bg-primary-container',
      'control-checked:group-data-focus-visible/control:bg-primary-container',
      'control-checked:group-data-pressed/control:bg-primary-container',
      'group-data-disabled/control:bg-[color-mix(in_srgb,var(--md-sys-color-on-surface)_38%,var(--md-sys-color-surface))]',
      'group-data-disabled/control:text-[color-mix(in_srgb,var(--md-sys-color-surface-container-highest)_38%,var(--md-sys-color-surface))]',
      'group-data-disabled/control:control-checked:bg-surface',
      'group-data-disabled/control:control-checked:text-[color-mix(in_srgb,var(--md-sys-color-on-surface)_38%,var(--md-sys-color-surface))]',
      'forced-colors:forced-color-adjust-none forced-colors:bg-[CanvasText]! forced-colors:text-[Canvas]!',
      'forced-colors:control-checked:bg-[HighlightText]! forced-colors:control-checked:text-[Highlight]!',
      'forced-colors:group-data-disabled/control:bg-[GrayText]! forced-colors:group-data-disabled/control:text-[Canvas]!',
      'forced-colors:group-data-disabled/control:control-checked:bg-[Canvas]! forced-colors:group-data-disabled/control:control-checked:text-[GrayText]!',
    ],
    icon: 'inline-flex size-[16px] items-center justify-center [&>svg]:size-full',
  },
  defaultVariants: { kind: 'track' },
});

/**
 * The variants of {@link switchStyles}, for building on its styles. They are the recipe's keys, not
 * component props: their names (`hasIcon`, `isOpen`…) follow the classes and may change.
 */
export type SwitchStyleProps = VariantProps<typeof switchStyles>;
