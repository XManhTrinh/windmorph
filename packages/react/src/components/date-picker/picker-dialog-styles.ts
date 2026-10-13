import { tv } from '../../utils/tv';

/*
 * Compose's DatePickerDialog (DatePickerModalTokens: `surface-container-high`, 28px corners,
 * level 3; actions 8px apart with 8px below and 6px at the end) and TimePickerDialog
 * (TimePickerTokens; 24px padding, a `label-medium` `on-surface-variant` title, the mode
 * toggle at the start of the actions row). Every class is written out in full.
 */

/** Variant definitions for {@link PickerDialog}. */
export const pickerDialogStyles = tv({
  slots: {
    panel: [
      'flex max-h-full max-w-full flex-col overflow-y-auto rounded-corner-extra-large',
      'bg-surface-container-high text-on-surface shadow-elevation-3 outline-none',
    ],
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
  },
  defaultVariants: { variant: 'date' },
});
