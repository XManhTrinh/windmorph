import type { ComponentAccessibility } from './types';

export const copyField: ComponentAccessibility = {
  keyboard: [
    { keys: ['Tab'], action: 'Moves to the field, then its copy button.' },
    { keys: ['Enter', 'Space'], action: 'Copies, on the button.' },
  ],
  keyboardNotes: [
    'Focus in the field selects its text, so it can also be copied with the keyboard.',
  ],
  screenReader: {
    role: 'A read-only `textbox` and a `button`.',
    name: 'The field from `label`; the button from `labels.copy`, which changes to `labels.copied` or `labels.copyFailed`.',
    states: 'Read only, and disabled when `disabled`.',
    notes: ['The result is announced in a polite live region mounted before it’s needed.'],
  },
  focus: ['Focus stays on the button while the confirmation shows.'],
  touchTarget: ['The button has a 48px target, as the core’s icon buttons do.'],
  motion: [
    'The icon fades between its states, and still does under reduced motion, since a fade isn’t movement.',
  ],
  consumer: [
    'Give it a `label` that says what the value is.',
    'Handle `onCopyError` where a copy that fails would strand someone.',
  ],
};
