import type { ComponentAccessibility } from './types';

export const timeField: ComponentAccessibility = {
  keyboard: [
    { keys: ['Tab'], action: 'Moves to the field, then its clock button.' },
    { keys: ['Enter'], action: 'Normalizes what’s typed; on the clock, opens the picker.' },
  ],
  keyboardNotes: [
    'The mobile keyboard is numeric on a 24-hour clock and full on a 12-hour one, which needs letters for “pm”.',
  ],
  screenReader: {
    role: 'A `textbox` and a `button`, opening a `dialog` with the time picker.',
    name: 'The field from `label`, and the button from `labels`.',
    states: 'Invalid, required, read only or disabled, as set.',
    notes: ['An error is linked to the field, and the format shows as its placeholder.'],
  },
  focus: [
    'After a keyboard or mouse press on the clock, focus returns to the text box. After a touch it returns to the clock button, so the on-screen keyboard doesn’t rise.',
  ],
  touchTarget: [
    'The field is 56px tall at density 0 and loses 4px a density step, as the core’s fields do.',
    'The clock is an icon button, with the core’s touch target.',
  ],
  motion: ['The picker follows the core’s dialog, which only fades under reduced motion.'],
  consumer: [
    'Give it a `label`.',
    'Set `min` and `max` where only some times are valid, and show why in `errorMessage`.',
  ],
};
