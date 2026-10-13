import { tv, type VariantProps } from '../../utils/tv';

/*
 * Values follow Compose Material 3 (TimePicker.kt, TimePickerTokens), portrait layout.
 *
 * Time selectors: 96 × 80px (114px wide for a 24-hour clock), 8px corners, `display-large`;
 * selected `primary-container` / `on-primary-container`, unselected
 * `surface-container-highest` / `on-surface`, a 24px `display-large` ":" between them.
 * Period selector (12-hour): 52 × 80px, 12px from the minutes, a 1px `outline` border with
 * 8px corners, `title-medium`; selected `tertiary-container` / `on-tertiary-container`
 * (the token colours; Compose's `isUpdatedTimepickerToggleEnabled` flag switches to
 * `primary-container`), unselected `on-surface-variant`. 36px below sits the 256px
 * `surface-container-highest` dial with `body-large` `on-surface` numbers on a 101px ring
 * (69px for the inner 24-hour ring), a 48px `primary` handle with `on-primary` text, a 2px
 * track and an 8px centre.
 *
 * Input mode: the selectors become 96 × 72px fields in `display-medium` with `body-small`
 * labels below; focused fields are `primary-container` with a 2px `primary` border.
 *
 * Every class is written out in full so Tailwind can find it.
 */

/** Variant definitions for {@link TimePicker}. */
export const timePickerStyles = tv({
  slots: {
    root: 'inline-flex shrink-0 flex-col items-center text-on-surface',
    display: 'flex items-start',
    selector: [
      'flex items-center justify-center rounded-corner-small outline-none state-layer focus-ring cursor-pointer',
      'bg-surface-container-highest text-on-surface',
      'data-selected:bg-primary-container data-selected:text-on-primary-container',
    ],
    separator: 'flex w-[24px] items-center justify-center text-display-large text-on-surface',
    period: [
      'ms-[12px] flex w-[52px] flex-col overflow-hidden rounded-corner-small border border-outline',
    ],
    periodOption: [
      'flex flex-1 cursor-pointer items-center justify-center text-title-medium text-on-surface-variant outline-none',
      'state-layer focus-ring-inset not-last:border-b not-last:border-outline',
      'data-selected:bg-tertiary-container data-selected:text-on-tertiary-container',
    ],
    dial: 'mt-[36px] size-[256px] touch-none rounded-full outline-none focus-ring select-none',
    dialFace: 'fill-surface-container-highest',
    dialNumber: 'fill-on-surface text-body-large data-selected:fill-on-primary',
    dialHandle: 'fill-primary',
    dialTrack: 'stroke-primary',
    field: [
      'h-[72px] rounded-corner-small border-2 border-transparent bg-surface-container-highest',
      'text-center text-display-medium text-on-surface caret-primary outline-none tabular-nums',
      'focus:border-primary focus:bg-primary-container focus:text-on-primary-container',
      'aria-invalid:border-error',
    ],
    fieldLabel: 'pt-[7px] text-body-small text-on-surface-variant',
    fieldColumn: 'flex flex-col',
  },
  variants: {
    hourCycle: {
      12: { selector: 'w-[96px]', field: 'w-[96px]' },
      24: { selector: 'w-[114px]', field: 'w-[114px]' },
    },
    mode: {
      dial: { selector: 'h-[80px] text-display-large', period: 'h-[80px]', separator: 'h-[80px]' },
      input: { period: 'h-[72px]', separator: 'h-[72px]' },
    },
  },
  defaultVariants: { hourCycle: 12, mode: 'dial' },
});

export type TimePickerStyleProps = VariantProps<typeof timePickerStyles>;
