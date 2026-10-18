import { tv, type VariantProps } from '../../utils/tv';

/*
 * Values follow the M3 date picker spec, with sizes from Compose Material 3 (DatePicker.kt,
 * DateRangePicker.kt, DatePickerDialog.kt, DatePickerModalTokens).
 *
 * At least 360px wide. Header at least 120px (128px for ranges): a `label-large` title
 * (24px start, 12px end, 16px top) and a `headline-large` headline (`title-large` for
 * ranges; 24px start, 12px end and bottom), both `on-surface-variant`, with the mode toggle
 * at the end, above an `outline-variant` divider. The body has 12px sides: a 56px month row
 * (the month / year button, `on-surface-variant`, and previous / next buttons), a 48px
 * weekday row (`body-large` `on-surface`) and six 48px week rows. Days are 40px circles
 * with a 48px touch target: `body-large` `on-surface`; selected `primary` / `on-primary`;
 * today a 1px `primary` outline with `primary` text; disabled 38%. In a range, the days
 * between are a 40px `secondary-container` band with `on-secondary-container` text. Years
 * are 72 × 36px pills with a 48px-tall target, in three columns 16px apart (selected
 * `primary`, this year outlined), in a 335px area.
 *
 * Months slide in from the side they come from on the default spatial spring (a fade only
 * with reduced motion). The range picker's month list scrolls vertically: each month has a
 * 48px `title-small` `on-surface-variant` subhead (8px below it, 24px in) over its six
 * week rows, under one weekday row.
 *
 * The headline, the picked days, today and the range band come from the modal date
 * picker's component tokens (`date-picker-tokens.ts`, `--md-comp-date-picker-modal-*`): the
 * root carries `data-tokens="md-comp-date-picker-modal"`, and the classes read one private
 * variable per part. A consumer class still wins in `cn()`.
 *
 * Every class is written out in full so Tailwind can find it.
 */

/**
 * Forced colours paint backgrounds as Canvas, so a picked day or year looked like any
 * other: it keeps a Highlight fill with HighlightText, opting out of the forced palette
 * (2026-10-15). `!important` beats the token colours, whose selectors are as specific.
 */
const forcedSelection = [
  'forced-colors:data-selected:bg-[Highlight]! forced-colors:data-selected:text-[HighlightText]!',
  'forced-colors:data-selected:forced-color-adjust-none',
];

/** Variant definitions for {@link DatePicker}, {@link DateRangePicker} and the docked calendar. */
export const datePickerStyles = tv({
  slots: {
    root: [
      'group/picker flex w-[360px] max-w-full shrink-0 flex-col text-on-surface',
      // A full-screen picker dialog spans the window, and the month list fills its height.
      'group-data-full-screen/picker-dialog:min-h-0 group-data-full-screen/picker-dialog:w-full group-data-full-screen/picker-dialog:flex-1',
    ],
    header: 'flex shrink-0 flex-col justify-between border-b border-outline-variant',
    title: 'ps-[24px] pe-[12px] pt-[16px] text-label-large text-on-surface-variant',
    headlineRow: 'flex items-end justify-between gap-[8px] ps-[24px] pe-[12px] pb-[12px]',
    headline: 'min-w-0 flex-1 text-[color:var(--_md-comp-date-picker-modal-header-headline-color)]',
    body: 'relative flex min-h-0 flex-col ps-[12px] pe-[12px]',
    nav: 'flex h-[56px] shrink-0 items-center justify-between',
    navButtons: 'flex items-center text-on-surface-variant',
    yearButtonIcon: [
      'inline-flex size-[18px] [&>svg]:size-full',
      '[transition-property:rotate] [transition-duration:var(--md-sys-motion-spring-spatial-default-duration)]',
      '[transition-timing-function:var(--md-sys-motion-spring-spatial-default-easing)]',
      'group-data-[years]/picker:rotate-180',
    ],
    // Horizontal swipes change the month; vertical ones still scroll the page.
    swipe: 'touch-pan-y overflow-hidden',
    // A new month slides in from the side it comes from.
    slide: [
      'translate-none opacity-100',
      '[transition-property:translate,opacity]',
      '[transition-duration:var(--md-sys-motion-spring-spatial-default-duration),var(--md-sys-motion-spring-effects-default-duration)]',
      '[transition-timing-function:var(--md-sys-motion-spring-spatial-default-easing),var(--md-sys-motion-spring-effects-default-easing)]',
      'data-[direction=next]:starting:translate-x-[48px] data-[direction=next]:starting:opacity-0',
      'data-[direction=previous]:starting:-translate-x-[48px] data-[direction=previous]:starting:opacity-0',
      'rtl:data-[direction=next]:starting:-translate-x-[48px]',
      'rtl:data-[direction=previous]:starting:translate-x-[48px]',
      'motion-reduce:starting:translate-none',
    ],
    // Calendar ↔ text input (Compose's display mode animation, enter side): the input rises
    // from below its own height, the calendar comes down 48px, both fading in, inside a
    // clipping view. Reduced motion keeps the fade.
    modeView: [
      'flex min-h-0 flex-1 flex-col overflow-hidden',
      '[&>*]:[transition-property:translate,opacity]',
      '[&>*]:[transition-duration:var(--md-sys-motion-spring-spatial-default-duration),var(--md-sys-motion-spring-effects-default-duration)]',
      '[&>*]:[transition-timing-function:var(--md-sys-motion-spring-spatial-default-easing),var(--md-sys-motion-spring-effects-default-easing)]',
      'data-[enter=input]:[&>*]:starting:translate-y-full data-[enter=input]:[&>*]:starting:opacity-0',
      'data-[enter=calendar]:[&>*]:starting:-translate-y-[48px] data-[enter=calendar]:[&>*]:starting:opacity-0',
      'motion-reduce:[&>*]:starting:translate-none',
    ],
    grid: 'w-full table-fixed border-collapse',
    weekday: 'h-[48px] cursor-default p-0 text-center text-body-large font-normal text-on-surface',
    weekdayRow: 'grid shrink-0 grid-cols-7',
    weekdayCell:
      'flex h-[48px] cursor-default items-center justify-center text-body-large text-on-surface',
    cell: [
      'h-[48px] p-0 text-center',
      // The range band: a 40px stripe behind the days between the ends.
      // 1px wider than the cell, so neighbouring bands never leave a hairline between them.
      'bg-[length:calc(100%+1px)_40px] bg-center bg-no-repeat',
      'data-[range=middle]:bg-[image:var(--_md-comp-date-picker-modal-range-middle)]',
      'data-[range=start]:bg-[image:var(--_md-comp-date-picker-modal-range-to-right)]',
      'data-[range=end]:bg-[image:var(--_md-comp-date-picker-modal-range-to-left)]',
      'rtl:data-[range=start]:bg-[image:var(--_md-comp-date-picker-modal-range-to-left)]',
      'rtl:data-[range=end]:bg-[image:var(--_md-comp-date-picker-modal-range-to-right)]',
    ],
    day: [
      // The 40px circle; its ::before widens the touch target to the 48px cell.
      'relative mx-auto flex size-[40px] cursor-pointer items-center justify-center rounded-corner-full',
      'before:absolute before:-inset-[4px] before:rounded-corner-full',
      'text-body-large text-on-surface outline-none state-layer focus-ring',
      'data-today:border data-in-range:text-on-secondary-container',
      'data-disabled:cursor-default data-disabled:text-on-surface/38',
      'data-outside:invisible',
      ...forcedSelection,
      // The range band is a background, which forced colours drop: the days between the
      // ends take a Highlight ring instead (2026-10-15).
      'forced-colors:data-in-range:not-data-selected:border forced-colors:data-in-range:not-data-selected:border-[Highlight]',
    ],
    years: [
      'grid h-[335px] grid-cols-3 content-start justify-items-center gap-y-[16px] overflow-y-auto overscroll-contain pt-[8px] pb-[8px]',
      // It expands down from the month row as it fades in from 60% (Compose's year picker
      // `expandVertically` + `fadeIn(initialAlpha = 0.6f)`, default effects); reduced motion
      // keeps the fade.
      '[clip-path:inset(0)] [transition-property:clip-path,opacity]',
      '[transition-duration:var(--md-sys-motion-spring-effects-default-duration)] [transition-timing-function:var(--md-sys-motion-spring-effects-default-easing)]',
      'starting:[clip-path:inset(0_0_100%_0)] starting:opacity-60 motion-reduce:starting:[clip-path:inset(0)]',
      // Closing, it lies over the grid below the month row, on the picker's container colour,
      // and shrinks back up to the month row as it fades out (Compose's `shrinkVertically` +
      // `fadeOut`, fast effects). Reduced motion keeps the fade.
      'data-exiting:absolute data-exiting:inset-x-[12px] data-exiting:top-[56px] data-exiting:z-10',
      'data-exiting:bg-[var(--_md-comp-date-picker-modal-container-color)] data-exiting:pointer-events-none',
      'data-exiting:[clip-path:inset(0_0_100%_0)] data-exiting:opacity-0 motion-reduce:data-exiting:[clip-path:inset(0)]',
      'data-exiting:[transition-duration:var(--md-sys-motion-spring-effects-fast-duration)] data-exiting:[transition-timing-function:var(--md-sys-motion-spring-effects-fast-easing)]',
    ],
    year: [
      // The 36px pill; its ::before makes the touch target 48px tall.
      'relative flex h-[36px] w-[72px] cursor-pointer items-center justify-center rounded-corner-full',
      'before:absolute before:-inset-y-[6px] before:inset-x-0',
      'text-body-large text-on-surface-variant outline-none state-layer focus-ring',
      'data-current:border data-current:border-primary data-current:text-primary',
      'data-selected:bg-primary data-selected:text-on-primary',
      'data-disabled:cursor-default data-disabled:text-on-surface/38',
      ...forcedSelection,
    ],
    months: [
      'h-[344px] min-h-0 overflow-y-auto overscroll-contain',
      'group-data-full-screen/picker-dialog:h-auto group-data-full-screen/picker-dialog:flex-1',
    ],
    monthSubhead:
      'flex h-[48px] items-end ps-[24px] pe-[12px] pb-[8px] text-title-small text-on-surface-variant',
    input: 'flex flex-col gap-[16px] ps-[24px] pe-[24px] pt-[16px] pb-[8px]',
  },
  variants: {
    range: {
      false: { header: 'min-h-[120px]', headline: 'text-headline-large' },
      // Full screen, the top row takes the title's space: Compose's range header is the
      // token's 128px less its 60px `HeaderHeightOffset`.
      true: {
        header: 'min-h-[128px] group-data-full-screen/picker-dialog:min-h-[68px]',
        headline: 'text-title-large',
      },
    },
    /**
     * The docked picker shows the days of the months around the shown one. Its days keep
     * their classes: the modal picker's tokens (`date-picker-tokens.ts`) colour the others.
     */
    docked: {
      true: {
        body: 'ps-0 pe-0',
        day: [
          'data-today:border-primary data-today:text-primary',
          'data-selected:bg-primary data-selected:text-on-primary',
          'data-outside:visible data-outside:text-on-surface-variant',
        ],
      },
      false: {
        day: [
          'data-today:border-[color:var(--_md-comp-date-picker-modal-date-today-container-outline-color)]',
          'data-today:text-[color:var(--_md-comp-date-picker-modal-date-today-label-text-color)]',
          'data-selected:bg-[var(--_md-comp-date-picker-modal-date-selected-container-color)]',
          'data-selected:text-[color:var(--_md-comp-date-picker-modal-date-selected-label-text-color)]',
        ],
      },
    },
  },
  defaultVariants: { range: false, docked: false },
});

/*
 * The docked date picker (M3 "Docked date picker"): a `surface-container-high` panel with
 * 16px corners at level 3 below its date field, 360px wide with 12px sides. A 56px row
 * holds two menu buttons (month and year), each between its previous / next icon buttons;
 * the month or year menu replaces the calendar with a 48px-row list under an
 * `outline-variant` divider (the chosen row `surface-variant` with a check), and text
 * buttons end the panel.
 */

/** Variant definitions for {@link DateField}'s docked calendar. */
export const dockedDatePickerStyles = tv({
  slots: {
    panel: [
      'flex w-[360px] max-w-full flex-col rounded-corner-large bg-surface-container-high',
      'ps-[12px] pe-[12px] text-on-surface shadow-elevation-3 outline-none',
      // Forced colours drop the surface and the shadow: a system-colour outline keeps the edge.
      'forced-colors:outline-solid forced-colors:outline-1 forced-colors:outline-[CanvasText]',
    ],
    calendar: 'flex flex-col',
    header: 'flex h-[56px] shrink-0 items-center justify-between',
    group: 'flex items-center text-on-surface-variant',
    menuButton: 'min-w-0 ps-[8px] pe-[4px] text-on-surface-variant',
    menuIcon: [
      'inline-flex size-[18px] [&>svg]:size-full',
      '[transition-property:rotate] [transition-duration:var(--md-sys-motion-spring-spatial-default-duration)]',
      '[transition-timing-function:var(--md-sys-motion-spring-spatial-default-easing)]',
      'data-open:rotate-180',
    ],
    view: 'h-[336px] min-h-0',
    list: [
      '-ms-[12px] -me-[12px] h-[336px] overflow-y-auto overscroll-contain',
      'border-t border-outline-variant pt-[8px] pb-[8px]',
    ],
    item: [
      'flex h-[48px] w-full cursor-pointer items-center gap-[16px] ps-[16px] pe-[24px] text-start',
      'text-body-large text-on-surface outline-none state-layer focus-ring-inset',
      'data-selected:bg-surface-variant',
      'data-disabled:cursor-default data-disabled:text-on-surface/38',
    ],
    check: 'inline-flex size-[24px] shrink-0 [&>svg]:size-full',
    actions: 'flex shrink-0 items-center justify-end gap-[8px] pt-[4px] pb-[8px]',
  },
});

/**
 * The variants of {@link datePickerStyles}, for building on its styles. They are the recipe's keys, not
 * component props: their names (`hasIcon`, `isOpen`…) follow the classes and may change.
 */
export type DatePickerStyleProps = VariantProps<typeof datePickerStyles>;
