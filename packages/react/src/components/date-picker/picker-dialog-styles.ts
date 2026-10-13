import { tv } from '../../utils/tv';

/*
 * Compose's DatePickerDialog (DatePickerModalTokens: `surface-container-high`, 28px corners,
 * level 3; actions 8px apart with 8px below and 6px at the end) and TimePickerDialog
 * (TimePickerTokens; 24px padding, a `label-medium` `on-surface-variant` title, the mode
 * toggle at the start of the actions row).
 *
 * Full screen (the M3 date picker's recommendation on compact windows) follows the M3
 * full-screen dialog, as `Dialog` does: the panel fills the window on `surface-container-high`
 * (the date picker's container role) with no corners or elevation, and a 56px top row holds
 * the `on-surface` close (x) icon button and the Save text button in place of the actions.
 * In a window too short for the whole dialog (a short window, or text at 200%), the panel
 * stops at the window's height and the picker scrolls inside it, above the actions, which
 * stay in view; the picker keeps its own size and never shrinks under them (2026-10-13).
 * Every class is written out in full.
 */

/** Variant definitions for {@link PickerDialog}. */
export const pickerDialogStyles = tv({
  slots: {
    panel: [
      'group/picker-dialog flex max-h-full max-w-full flex-col overflow-hidden rounded-corner-extra-large',
      'bg-surface-container-high text-on-surface shadow-elevation-3 outline-none',
    ],
    header: 'flex h-[56px] shrink-0 items-center justify-between ps-[4px] pe-[12px]',
    close: '[--md-comp-icon-button-icon-color:var(--md-sys-color-on-surface)]',
    title: 'shrink-0 pb-[20px] text-label-medium text-on-surface-variant',
    // The picker scrolls here, between the title and the actions, when the window is too
    // short for it; the actions stay in view below it.
    content: 'flex min-h-0 flex-col overflow-y-auto overscroll-contain',
    actions: 'flex shrink-0 items-center justify-between gap-[8px]',
    buttons: 'ms-auto flex items-center gap-[8px]',
  },
  variants: {
    variant: {
      date: { actions: 'pe-[6px] pb-[8px] ps-[12px]' },
      time: { panel: 'p-[24px]', actions: 'pt-[24px]' },
    },
    fullScreen: {
      true: {
        panel: 'size-full max-h-none max-w-none overflow-hidden rounded-none shadow-none',
        content: 'flex-1 items-center',
        actions: 'hidden',
      },
      false: {},
    },
  },
  compoundVariants: [
    { variant: 'time', fullScreen: true, class: { panel: 'pt-0', content: 'justify-center' } },
  ],
  defaultVariants: { variant: 'date', fullScreen: false },
});
