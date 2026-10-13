import { tv, type VariantProps } from '../../utils/tv';

/*
 * Values follow the M3 time picker spec, with sizes from Compose Material 3 (TimePicker.kt,
 * TimePickerTokens, TimeInputTokens).
 *
 * Time selectors: 96 × 80px (114px wide for a 24-hour dial), 8px corners, `display-large`;
 * selected `primary-container` / `on-primary-container`, unselected
 * `surface-container-highest` / `on-surface`, a 24px `display-large` ":" between them.
 * They take typed digits too. Period selector (12-hour): 52 × 80px beside the minutes
 * (12px away) in the vertical layout, 216 × 38px below the time (16px away) in the
 * horizontal one; a 1px `outline` border with 8px corners, `title-medium`; selected
 * `tertiary-container` / `on-tertiary-container` (the token colours; Compose's
 * `isUpdatedTimepickerToggleEnabled` flag switches to `primary-container`), unselected
 * `on-surface-variant`. The 256px `surface-container-highest` dial sits 36px below the time
 * (vertical) or 36px beside it (horizontal), with `body-large` `on-surface` numbers on a
 * 101px ring (69px for the inner 24-hour ring), each a 48px target; a 48px `primary`
 * handle with `on-primary` text, a 2px track and an 8px centre.
 *
 * Input mode: 96 × 72px fields (24 hours too, `TimeInputTokens.TimeFieldContainerWidth`)
 * in `display-medium` with `body-small` labels 7px below; focused fields are
 * `primary-container` with a 2px `primary` border.
 *
 * Every class is written out in full so Tailwind can find it.
 */

/** Variant definitions for {@link TimePicker}. */
export const timePickerStyles = tv({
  slots: {
    root: 'inline-flex shrink-0 items-center text-on-surface',
    display: 'flex',
    time: 'flex items-start',
    selector: [
      'h-[80px] rounded-corner-small text-center text-display-large outline-none focus-ring',
      'cursor-pointer caret-transparent tabular-nums',
      'bg-surface-container-highest text-on-surface',
      'data-selected:bg-primary-container data-selected:text-on-primary-container',
      'aria-invalid:outline-2 aria-invalid:outline-error',
    ],
    separator: 'flex w-[24px] items-center justify-center text-display-large text-on-surface',
    period: 'flex overflow-hidden rounded-corner-small border border-outline',
    periodOption: [
      'flex flex-1 cursor-pointer items-center justify-center text-title-medium text-on-surface-variant outline-none',
      'state-layer focus-ring-inset',
      'data-selected:bg-tertiary-container data-selected:text-on-tertiary-container',
    ],
    dial: 'size-[256px] shrink-0 touch-none rounded-full outline-none select-none',
    dialFace: 'fill-surface-container-highest',
    dialNumber: 'cursor-pointer outline-none',
    dialNumberHit: 'fill-transparent',
    dialNumberText: 'fill-on-surface text-body-large data-selected:fill-on-primary',
    dialFocus: 'fill-none stroke-secondary',
    dialHandle: 'fill-primary',
    dialTrack: 'stroke-primary',
    field: [
      'h-[72px] w-[96px] rounded-corner-small border-2 border-transparent bg-surface-container-highest',
      'text-center text-display-medium text-on-surface caret-primary outline-none tabular-nums',
      'focus:border-primary focus:bg-primary-container focus:text-on-primary-container',
      'aria-invalid:border-error',
    ],
    fieldLabel: 'pt-[7px] text-body-small text-on-surface-variant',
    fieldColumn: 'flex flex-col',
  },
  variants: {
    hourCycle: {
      12: { selector: 'w-[96px]' },
      24: { selector: 'w-[114px]' },
    },
    mode: {
      dial: { separator: 'h-[80px]' },
      input: { separator: 'h-[72px]' },
    },
    layout: {
      vertical: {
        root: 'flex-col',
        display: 'flex-row items-start',
        period: 'ms-[12px] w-[52px] flex-col',
        periodOption: 'not-last:border-b not-last:border-outline',
        dial: 'mt-[36px]',
      },
      horizontal: {
        root: 'flex-row',
        display: 'flex-col items-center',
        period: 'mt-[16px] h-[38px] w-[216px] flex-row',
        periodOption: 'not-last:border-e not-last:border-outline',
        dial: 'ms-[36px]',
      },
    },
  },
  compoundVariants: [
    { mode: 'dial', layout: 'vertical', class: { period: 'h-[80px]' } },
    { mode: 'input', class: { period: 'h-[72px]' } },
  ],
  defaultVariants: { hourCycle: 12, mode: 'dial', layout: 'vertical' },
});

export type TimePickerStyleProps = VariantProps<typeof timePickerStyles>;
