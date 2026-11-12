import type { ComponentAccessibility } from './types';

export const timeField: ComponentAccessibility = {
  keyboard: [
    { keys: ['Tab'], action: 'Moves to the field, then its clock button.' },
    { keys: ['Enter'], action: 'Normalizes what’s typed; on the clock, opens the picker.' },
    {
      keys: ['↑', '↓', 'Home', 'End', 'Page Up', 'Page Down'],
      action: 'In a docked list, move between the times; a digit jumps to a time starting with it.',
    },
    { keys: ['Enter', 'Space'], action: 'In a docked list, pick the time and close the list.' },
    { keys: ['Esc'], action: 'Closes the picker or the list and changes nothing.' },
  ],
  keyboardNotes: [
    'The mobile keyboard is numeric on a 24-hour clock and full on a 12-hour one, which needs letters for “pm”.',
  ],
  screenReader: {
    role: 'A `textbox` and a `button`, opening a `dialog` with the time picker, or docked a `listbox` of times as `option`s, the field’s one selected.',
    name: 'The field from `label`, and the button from `labels`.',
    states: 'Invalid, required, read only or disabled, as set.',
    notes: ['An error is linked to the field, and the format shows as its placeholder.'],
  },
  focus: [
    'After a keyboard or mouse press on the clock, focus returns to the text box. After a touch it returns to the clock button, so the on-screen keyboard doesn’t rise.',
    'A docked list takes focus as it opens, on the field’s time, or with none on the time nearest now; only the list scrolls to it, never the page.',
  ],
  touchTarget: [
    'The field is 56px tall at density 0 and loses 4px a density step, as the core’s fields do.',
    'The clock is an icon button, with the core’s touch target.',
  ],
  motion: [
    'The picker follows the core’s dialog, which only fades under reduced motion.',
    'The docked list opens as a menu does, and only fades under reduced motion.',
  ],
  consumer: [
    'Give it a `label`.',
    'Set `min` and `max` where only some times are valid, and show why in `errorMessage`.',
  ],
};
