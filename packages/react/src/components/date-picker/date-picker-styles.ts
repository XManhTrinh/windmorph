import { tv, type VariantProps } from '../../utils/tv';

/*
 * Values follow Compose Material 3 (DatePicker.kt, DateRangePicker.kt, DatePickerDialog.kt,
 * DatePickerModalTokens).
 *
 * At least 360px wide. Header at least 120px (128px for ranges): a `label-large` title
 * (24px start, 12px end, 16px top) and a `headline-large` headline (`title-large` for
 * ranges; 24px start, 12px end and bottom), both `on-surface-variant`, with the mode toggle
 * at the end, above an `outline-variant` divider. The body has 12px sides: a 56px month row
 * (the month / year button, `on-surface-variant`, and previous / next buttons), a 48px
 * weekday row (`body-large` `on-surface`) and six 48px week rows. Days are 40px circles:
 * `body-large` `on-surface`; selected `primary` / `on-primary`; today a 1px `primary`
 * outline with `primary` text; disabled 38%. In a range, the days between are a 40px
 * `secondary-container` band with `on-secondary-container` text. Years are 72 × 36px pills
 * in three columns 16px apart (selected `primary`, this year outlined), in a 335px area.
 *
 * Every class is written out in full so Tailwind can find it.
 */

/** Variant definitions for {@link DatePicker} and {@link DateRangePicker}. */
export const datePickerStyles = tv({
  slots: {
    root: 'group/picker flex w-[360px] max-w-full shrink-0 flex-col text-on-surface',
    header: 'flex flex-col justify-between border-b border-outline-variant',
    title: 'ps-[24px] pe-[12px] pt-[16px] text-label-large text-on-surface-variant',
    headlineRow: 'flex items-end justify-between gap-[8px] ps-[24px] pe-[12px] pb-[12px]',
    headline: 'min-w-0 flex-1 text-on-surface-variant',
    body: 'flex flex-col ps-[12px] pe-[12px]',
    nav: 'flex h-[56px] items-center justify-between',
    navButtons: 'flex items-center text-on-surface-variant',
    yearButtonIcon: [
      'inline-flex size-[18px] [&>svg]:size-full',
      '[transition-property:rotate] [transition-duration:var(--md-sys-motion-spring-spatial-default-duration)]',
      '[transition-timing-function:var(--md-sys-motion-spring-spatial-default-easing)]',
      'group-data-[years]/picker:rotate-180',
    ],
    grid: 'w-full table-fixed border-collapse',
    weekday: 'h-[48px] p-0 text-center text-body-large font-normal text-on-surface',
    cell: [
      'h-[48px] p-0 text-center',
      // The range band: a 40px stripe behind the days between the ends.
      'bg-[length:100%_40px] bg-center bg-no-repeat',
      'data-[range=middle]:bg-[linear-gradient(var(--color-secondary-container),var(--color-secondary-container))]',
      'data-[range=start]:bg-[linear-gradient(to_right,transparent_50%,var(--color-secondary-container)_50%)]',
      'data-[range=end]:bg-[linear-gradient(to_left,transparent_50%,var(--color-secondary-container)_50%)]',
      'rtl:data-[range=start]:bg-[linear-gradient(to_left,transparent_50%,var(--color-secondary-container)_50%)]',
      'rtl:data-[range=end]:bg-[linear-gradient(to_right,transparent_50%,var(--color-secondary-container)_50%)]',
    ],
    day: [
      'mx-auto flex size-[40px] cursor-pointer items-center justify-center rounded-corner-full',
      'text-body-large text-on-surface outline-none state-layer focus-ring',
      'data-today:border data-today:border-primary data-today:text-primary',
      'data-in-range:text-on-secondary-container',
      'data-selected:bg-primary data-selected:text-on-primary',
      'data-disabled:cursor-default data-disabled:text-on-surface/38',
      'data-outside:invisible',
    ],
    years: [
      'grid h-[335px] grid-cols-3 content-start justify-items-center gap-y-[16px] overflow-y-auto overscroll-contain pt-[8px] pb-[8px]',
    ],
    year: [
      'flex h-[36px] w-[72px] cursor-pointer items-center justify-center rounded-corner-full',
      'text-body-large text-on-surface-variant outline-none state-layer focus-ring',
      'data-current:border data-current:border-primary data-current:text-primary',
      'data-selected:bg-primary data-selected:text-on-primary',
      'data-disabled:cursor-default data-disabled:text-on-surface/38',
    ],
    input: 'flex flex-col ps-[24px] pe-[24px] pt-[16px] pb-[8px]',
  },
  variants: {
    range: {
      false: { header: 'min-h-[120px]', headline: 'text-headline-large' },
      true: { header: 'min-h-[128px]', headline: 'text-title-large' },
    },
  },
  defaultVariants: { range: false },
});

/*
 * Compose's date input is an outlined text field with a "Date" label. This is that field
 * for React Aria's date segments: 56px, a 1px `outline` border (2px `primary` focused,
 * `error` when invalid), 4px corners, the label sitting on the border in `body-small`.
 */
export const dateFieldStyles = tv({
  slots: {
    root: 'flex flex-col gap-[4px]',
    field: [
      'flex h-[56px] items-center rounded-corner-extra-small border border-outline ps-[16px] pe-[16px]',
      'text-body-large text-on-surface',
      'has-[:focus]:border-2 has-[:focus]:border-primary has-[:focus]:ps-[15px] has-[:focus]:pe-[15px]',
      'data-invalid:border-error',
    ],
    label: 'ps-[4px] text-body-small text-on-surface-variant',
    segment: [
      'rounded-corner-extra-small ps-[1px] pe-[1px] tabular-nums outline-none',
      'data-placeholder:text-on-surface-variant',
      'focus:bg-primary focus:text-on-primary',
    ],
    literal: 'text-on-surface-variant',
    error: 'ps-[16px] text-body-small text-error',
  },
});

export type DatePickerStyleProps = VariantProps<typeof datePickerStyles>;
