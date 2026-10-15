import type { ComponentAccessibility } from './types';

export const checkbox: ComponentAccessibility = {
  keyboard: [
    { keys: ['Tab'], action: 'Moves focus to the checkbox, and on to the next element.' },
    { keys: ['Space'], action: 'Checks or unchecks it.' },
  ],
  keyboardNotes: [
    "Enter doesn't toggle a checkbox, as with a native one; in a form it submits the form.",
  ],
  screenReader: {
    role: '`checkbox`: a visually hidden native `<input type="checkbox">` (React Aria `useCheckbox`), inside a `<label>`.',
    name: 'Its label (`children`), or `aria-label` or `aria-labelledby` without one. One of the three is required.',
    states:
      'Checked, not checked, or mixed ("partially checked") with `indeterminate`; disabled; required (`aria-required`, or the native `required` with `validationBehavior="native"`); invalid (`aria-invalid`).',
    notes: [
      'The drawn box, check mark and dash are hidden from assistive tech; the native input carries the state, so forms and labels work as they do natively.',
      '`indeterminate` only changes what is shown and announced; the checked state underneath stays as it was until the user acts.',
    ],
  },
  focus: [
    "A disabled checkbox can't be focused. A read-only one can, but can't be changed.",
    "Keyboard focus shows M3's focus indicator around the 40px control: a 3px `secondary` outline 2px outside it, with the focus state layer. Pointer presses show no ring.",
  ],
  touchTarget: [
    'The 18px box sits in a 40px control with an invisible 48 × 48px touch target. The whole label is part of the target too, since the root is a `<label>`.',
  ],
  motion: [
    'Under reduced motion the check mark appears at once instead of drawing in, and the box fills with a fade only. The press ripple appears at full size without growing.',
  ],
  consumer: [
    'Give every checkbox a visible label that says what checking it means.',
    'For a parent checkbox, set `indeterminate` while some, but not all, of its children are checked, and update it and the children in `onSelectedChange`.',
    'Put related checkboxes under a visible heading or in a `fieldset` with a `legend`, so the group has a name.',
    'Show an error message next to an `invalid` checkbox and link it with `aria-describedby`; the checkbox only shows the error colour.',
  ],
};
