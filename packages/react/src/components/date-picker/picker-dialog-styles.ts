import { tv } from '../../utils/tv';

/*
 * Compose's DatePickerDialog (DatePickerModalTokens: `surface-container-high`, 28px corners,
 * level 3; actions 8px apart with 8px below and 6px at the end) and TimePickerDialog
 * (TimePickerTokens; 24px padding, a `label-medium` `on-surface-variant` title, the mode
 * toggle at the start of the actions row).
 *
 * Full screen (the M3 date picker's recommendation on compact windows) follows the M3
 * full-screen dialog, as `Dialog` does: the panel fills the window on `surface` with no
 * corners or elevation, and a 64px top row holds the close (x) icon button and the Save
 * text button in place of the actions. Every class is written out in full.
 */

/** Variant definitions for {@link PickerDialog}. */
export const pickerDialogStyles = tv({
  slots: {
    panel: [
      'group/picker-dialog flex max-h-full max-w-full flex-col overflow-y-auto rounded-corner-extra-large',
      'bg-surface-container-high text-on-surface shadow-elevation-3 outline-none',
    ],
    header: 'flex h-[64px] shrink-0 items-center justify-between ps-[4px] pe-[12px]',
    title: 'pb-[20px] text-label-medium text-on-surface-variant',
    content: 'flex min-h-0 flex-col',
    actions: 'flex items-center justify-between gap-[8px]',
    buttons: 'ms-auto flex items-center gap-[8px]',
  },
  variants: {
    variant: {
      date: { actions: 'pe-[6px] pb-[8px] ps-[12px]' },
      time: { panel: 'p-[24px]', actions: 'pt-[24px]' },
    },
    fullScreen: {
      true: {
        panel:
          'size-full max-h-none max-w-none overflow-hidden rounded-none bg-surface shadow-none',
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
