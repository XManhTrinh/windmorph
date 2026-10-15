import { tv, type VariantProps } from '../../utils/tv';

/*
 * Values follow Compose Material 3 (Slider.kt, SliderTokens) and, for the Expressive sizes
 * Compose doesn't ship, the M3 spec's measurements table (handle heights) and the M3 token
 * values in Material Components Android (`m3_comp_slider_{xsmall…xlarge}_*`):
 *
 * | size | track | corner | handle | inset icon |
 * | xs   | 16px  | 8px    | 44px   | —          |
 * | sm   | 24px  | 8px    | 44px   | —          |
 * | md   | 40px  | 12px   | 52px   | 24px       |
 * | lg   | 56px  | 16px   | 68px   | 24px       |
 * | xl   | 96px  | 28px   | 108px  | 32px       |
 *
 * Active track and handle `primary`, inactive track `secondary-container`; the handle is
 * 4px wide, 2px while pressed, dragged or focused, with a 6px gap to the track (10px while
 * keyboard-focused, for the focus ring). Stop indicators and ticks are 4px dots,
 * `on-primary` on the active track and `on-secondary-container` on the inactive one
 * (`inverse-on-surface` / `on-surface` 38% disabled; m3.material.io tokens). Disabled:
 * active track `on-surface` 38%, inactive 12%, handle `on-surface` 38% over `surface`.
 * Inset icons sit 10px inside the track, `on-primary` / `on-secondary-container` (MDC);
 * when the active track is too short for the start icon, it moves to the inactive track
 * (M3 spec).
 * The value indicator is a 44px `inverse-surface` pill with `label-large`
 * `inverse-on-surface` text, 12px above the handle.
 *
 * The track is one grid cell: segments, ticks and thumbs are placed with logical margins,
 * so nothing is positioned. A vertical slider writes its track bottom-to-top
 * (`writing-mode: vertical-lr` + `direction: rtl`), so the same geometry serves both
 * orientations and RTL. The track, handle, inactive stop and value indicator colours come
 * from the slider's component tokens (`slider-tokens.ts`, `--md-comp-slider-*`); the root
 * carries `data-tokens` and `data-size`. Every class is written out in full so Tailwind can
 * find it.
 */

/** Variant definitions for {@link Slider} and {@link RangeSlider}; extend them to add sizes. */
export const sliderStyles = tv({
  slots: {
    root: [
      'group/slider flex shrink-0 touch-none select-none',
      '[--m3-slider-gap-0:6px] [--m3-slider-gap-1:6px]',
      'has-[[data-thumb="0"][data-focus-visible]]:[--m3-slider-gap-0:10px]',
      'has-[[data-thumb="1"][data-focus-visible]]:[--m3-slider-gap-1:10px]',
    ],
    // The track takes the presses. Its hit area is at least 48px across (M3's touch target)
    // without changing the layout: a transparent layer under its parts reaches 2px past an
    // xs or sm slider's 44px on each side. The block axis is the cross axis in both
    // orientations (a vertical track's writing mode is vertical).
    track: [
      'relative isolate grid flex-1 cursor-pointer grid-cols-1 grid-rows-1 items-center justify-items-start group-data-disabled/slider:cursor-default',
      "before:absolute before:-z-10 before:[inset-inline:0] before:[inset-block:min(0px,calc((100%_-_48px)/2))] before:content-['']",
    ],
    segment: [
      'col-start-1 row-start-1 flex [block-size:var(--m3-slider-track)] items-center overflow-hidden',
      'data-[tone=active]:bg-[var(--_md-comp-slider-active-track-color)]',
      'data-[tone=inactive]:bg-[var(--_md-comp-slider-inactive-track-color)]',
      'group-data-disabled/slider:data-[tone=active]:bg-on-surface/38',
      'group-data-disabled/slider:data-[tone=inactive]:bg-on-surface/12',
    ],
    // Stop indicators follow the live m3.material.io token table (2026-10-13): on the active
    // track `on-primary`, on the inactive track `on-secondary-container`; disabled,
    // `inverse-on-surface` and `on-surface` at the table's 0.38 disabled stop opacity.
    stop: [
      'size-[4px] shrink-0 rounded-full',
      'in-data-[tone=active]:bg-on-primary',
      'in-data-[tone=inactive]:bg-[var(--_md-comp-slider-stop-indicator-color)]',
      'group-data-disabled/slider:in-data-[tone=active]:bg-inverse-on-surface',
      'group-data-disabled/slider:in-data-[tone=inactive]:bg-on-surface/38',
    ],
    tick: [
      'col-start-1 row-start-1 size-[4px] rounded-full',
      'data-active:bg-on-primary not-data-active:bg-[var(--_md-comp-slider-stop-indicator-color)]',
      'group-data-disabled/slider:data-active:bg-inverse-on-surface',
      'group-data-disabled/slider:not-data-active:bg-on-surface/38',
    ],
    icon: [
      'flex shrink-0 items-center justify-center overflow-hidden',
      'in-data-[tone=active]:text-on-primary in-data-[tone=inactive]:text-on-secondary-container',
      '[&>svg]:[block-size:var(--m3-slider-icon)] [&>svg]:[inline-size:var(--m3-slider-icon)] [&>svg]:shrink-0',
    ],
    // The start icon, moved to the inactive track while the active one is too short for it.
    movedIcon: [
      'col-start-1 row-start-1 flex shrink-0 items-center justify-center overflow-hidden',
      'text-on-secondary-container',
      '[&>svg]:[block-size:var(--m3-slider-icon)] [&>svg]:[inline-size:var(--m3-slider-icon)] [&>svg]:shrink-0',
    ],
    thumb: [
      'col-start-1 row-start-1 flex [inline-size:4px] [block-size:var(--m3-slider-handle)] cursor-pointer justify-center',
      'rounded-full focus-ring group-data-disabled/slider:cursor-default',
    ],
    handle: [
      '[inline-size:4px] [block-size:100%] rounded-full bg-[var(--_md-comp-slider-handle-color)]',
      'data-active:[inline-size:2px]',
      'group-data-disabled/slider:bg-[color-mix(in_srgb,var(--md-sys-color-on-surface)_38%,var(--md-sys-color-surface))]',
    ],
    // A zero-size box at the thumb that the value indicator hangs from.
    // It sits 12px before the row's block start (above, or left of a vertical slider).
    labelAnchor:
      'col-start-1 row-start-1 flex [inline-size:0] [block-size:0] items-end justify-center self-start [margin-block-start:-12px]',
    label: [
      'flex h-[44px] min-w-[48px] items-center justify-center rounded-full ps-[16px] pe-[16px]',
      'bg-[var(--_md-comp-slider-value-indicator-container-color)] text-label-large whitespace-nowrap',
      'text-[color:var(--_md-comp-slider-value-indicator-label-label-text-color)]',
      '[direction:ltr] [writing-mode:horizontal-tb]',
    ],
  },
  variants: {
    orientation: {
      horizontal: {
        root: 'h-(--m3-slider-handle) w-full flex-row items-center',
        track: 'ms-[2px] me-[2px] self-stretch',
      },
      vertical: {
        root: 'h-[240px] w-(--m3-slider-handle) flex-col items-center',
        // Inline axis runs bottom-to-top, so the geometry and logical properties carry over.
        track: 'mt-[2px] mb-[2px] self-stretch [direction:rtl] [writing-mode:vertical-lr]',
      },
    },
    size: {
      xs: { root: '[--m3-slider-track:16px] [--m3-slider-corner:8px] [--m3-slider-handle:44px]' },
      sm: { root: '[--m3-slider-track:24px] [--m3-slider-corner:8px] [--m3-slider-handle:44px]' },
      md: {
        root: '[--m3-slider-track:40px] [--m3-slider-corner:12px] [--m3-slider-handle:52px] [--m3-slider-icon:24px]',
      },
      lg: {
        root: '[--m3-slider-track:56px] [--m3-slider-corner:16px] [--m3-slider-handle:68px] [--m3-slider-icon:24px]',
      },
      xl: {
        root: '[--m3-slider-track:96px] [--m3-slider-corner:28px] [--m3-slider-handle:108px] [--m3-slider-icon:32px]',
      },
    },
  },
  defaultVariants: { orientation: 'horizontal', size: 'xs' },
});

export type SliderStyleProps = VariantProps<typeof sliderStyles>;
export type SliderSize = NonNullable<SliderStyleProps['size']>;
export type SliderOrientation = NonNullable<SliderStyleProps['orientation']>;
