import { selectionControlStyles } from '../../primitives/selection-control-styles';
import { tv, type VariantProps } from '../../utils/tv';

/*
 * Values follow Compose Material 3 (Switch.kt and SwitchTokens): a 52×32px track with a
 * 2px outline; the thumb is 16px (off), 24px (on, or with an icon) and 28px (pressed),
 * centred 16px or 36px from the track's start. Pressing snaps the thumb; releasing
 * animates it on the fast spatial spring. The 40px state layer follows the thumb.
 * Disabled colours are Compose's composites over `surface`. `--m3-thumb-size` and
 * `--m3-thumb-center` are set by the component. Every class is written out in full.
 */

const thumbMotion =
  '[transition-duration:var(--md-sys-motion-spring-spatial-fast-duration),var(--md-sys-motion-spring-spatial-fast-duration),var(--md-sys-motion-spring-spatial-fast-duration),var(--md-sys-motion-spring-spatial-fast-duration),var(--md-sys-motion-spring-effects-default-duration)] [transition-timing-function:var(--md-sys-motion-spring-spatial-fast-easing),var(--md-sys-motion-spring-spatial-fast-easing),var(--md-sys-motion-spring-spatial-fast-easing),var(--md-sys-motion-spring-spatial-fast-easing),var(--md-sys-motion-spring-effects-default-easing)]';

/** Variant definitions for {@link Switch}. */
export const switchStyles = tv({
  extend: selectionControlStyles,
  slots: {
    // The control is the track.
    control: [
      'h-[32px] w-[52px] border-2 border-solid border-outline bg-surface-container-highest',
      '[transition-property:background-color,border-color]',
      '[transition-duration:var(--md-sys-motion-spring-effects-default-duration)]',
      '[transition-timing-function:var(--md-sys-motion-spring-effects-default-easing)]',
      'group-data-selected/control:border-primary group-data-selected/control:bg-primary',
      'group-data-disabled/control:border-[color-mix(in_srgb,var(--md-sys-color-on-surface)_12%,var(--md-sys-color-surface))]',
      'group-data-disabled/control:bg-[color-mix(in_srgb,var(--md-sys-color-surface-container-highest)_12%,var(--md-sys-color-surface))]',
      'group-data-disabled/control:group-data-selected/control:border-transparent',
      'group-data-disabled/control:group-data-selected/control:bg-[color-mix(in_srgb,var(--md-sys-color-on-surface)_12%,var(--md-sys-color-surface))]',
    ],
    stateLayer: [
      'pointer-events-none absolute -top-[6px] start-[calc(var(--m3-thumb-center)-22px)] size-[40px] rounded-full',
      'state-layer [--m3-ripple-size:20px] [--m3-ripple-start:12px]',
      '[--m3-state-layer-color:var(--md-sys-color-on-surface)]',
      'data-selected:[--m3-state-layer-color:var(--md-sys-color-primary)]',
      '[--m3-transition-property:inset-inline-start]',
      '[--m3-transition-duration:var(--md-sys-motion-spring-spatial-fast-duration)]',
      '[--m3-transition-easing:var(--md-sys-motion-spring-spatial-fast-easing)]',
      '[--m3-transition-delay:0s]',
    ],
    thumb: [
      'absolute top-[calc(14px-var(--m3-thumb-size)/2)] start-[calc(var(--m3-thumb-center)-var(--m3-thumb-size)/2-2px)]',
      'flex size-[var(--m3-thumb-size)] items-center justify-center rounded-full bg-outline text-surface-container-highest',
      '[transition-property:width,height,top,inset-inline-start,background-color]',
      thumbMotion,
      'group-data-pressed/control:[transition-duration:0s,0s,0s,0s,var(--md-sys-motion-spring-effects-default-duration)]',
      'group-data-hovered/control:bg-on-surface-variant',
      'group-data-focus-visible/control:bg-on-surface-variant',
      'group-data-pressed/control:bg-on-surface-variant',
      'group-data-selected/control:bg-on-primary group-data-selected/control:text-on-primary-container',
      'group-data-selected/control:group-data-hovered/control:bg-primary-container',
      'group-data-selected/control:group-data-focus-visible/control:bg-primary-container',
      'group-data-selected/control:group-data-pressed/control:bg-primary-container',
      'group-data-disabled/control:bg-[color-mix(in_srgb,var(--md-sys-color-on-surface)_38%,var(--md-sys-color-surface))]',
      'group-data-disabled/control:text-[color-mix(in_srgb,var(--md-sys-color-surface-container-highest)_38%,var(--md-sys-color-surface))]',
      'group-data-disabled/control:group-data-selected/control:bg-surface',
      'group-data-disabled/control:group-data-selected/control:text-[color-mix(in_srgb,var(--md-sys-color-on-surface)_38%,var(--md-sys-color-surface))]',
    ],
    icon: 'inline-flex size-[16px] items-center justify-center [&>svg]:size-full',
  },
  defaultVariants: { kind: 'track' },
});

export type SwitchStyleProps = VariantProps<typeof switchStyles>;
