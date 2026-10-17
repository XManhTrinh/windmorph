import type { ComponentAccessibility } from './types';

export const textField: ComponentAccessibility = {
  keyboard: [
    {
      keys: ['Tab'],
      action:
        'Moves focus to the input, then to a trailing icon button if there is one, and on to the next element.',
    },
    {
      keys: ['Enter'],
      action:
        'Submits the enclosing form from a single-line field, as a native input does. In a multiline field it starts a new line.',
    },
  ],
  keyboardNotes: [
    "Typing, selection, paste and undo are the browser's own: the field is a native `<input>`, or a `<textarea>` with `multiline`.",
  ],
  screenReader: {
    role: 'A native text `input`, or a `textarea` with `multiline`, labelled by a `<label>` (React Aria `useTextField`).',
    name: 'The visible `label`, with a `*` when `required`; without one, `aria-label` or `aria-labelledby`. One of the three is required.',
    states:
      'Required (`aria-required`), invalid (`aria-invalid`), disabled and read-only, all from the native input.',
    notes: [
      'The description, in this order: the prefix and suffix (read as `prefixLabel` and `suffixLabel` when given, "US dollars" for "$"), the supporting text, the error message, and the character counter, read as "Character count: 12 of 80" (`labels.characterCount`).',
      'When the field is invalid the error message is shown in place of the supporting text, which stays in the description as visually hidden text. The error message has the `alert` role, so it is announced as it appears.',
      'While invalid, and without a `trailingIcon`, the field shows an error icon with the `img` role, named "Error" (`labels.error`). `errorIcon` replaces it, and `false` removes it.',
      'Leading icons are hidden from assistive tech (`aria-hidden`). A `trailingIcon` is not, so an icon button there keeps its name.',
      'With `supportingTextOnFocus`, the supporting text only shows while the field has focus, but screen readers always get it.',
      "The attributes that describe the input go to it, not to the field's container: `aria-controls`, `aria-expanded`, `aria-haspopup`, `aria-autocomplete` and `aria-activedescendant` for a field that opens its own suggestions, and an `aria-invalid` or `aria-required` a form library sets.",
    ],
  },
  focus: [
    "A disabled field can't be focused. A read-only field can, so its value can be selected and copied.",
    'Pressing anywhere in the container, except on an icon button or another control, focuses the input.',
    "Focus is shown by the field itself, as M3 draws it: the filled field's indicator line and the outlined field's border thicken to 2px and take the focus colour, along with the label. There is no separate focus ring.",
  ],
  touchTarget: [
    'The container is at least 56px tall and spans the field, and leading and trailing icons sit in 48 × 48px boxes, so the field meets the 48px minimum.',
  ],
  motion: [
    'Under reduced motion the label floats and settles at once, and the border and indicator change thickness at once; colours still fade.',
  ],
  consumer: [
    'Give every field a visible `label`. Use `aria-label` only where the purpose is clear without one, such as a search field with a search icon.',
    'Pass an `errorMessage` that says how to fix the problem ("Enter an email address like name@example.com"), not just that it is wrong.',
    'Say "Read-only" in the supporting text of a `readOnly` field, since it looks like an editable one.',
    'Set `type`, `inputMode` and `autoComplete` to match the data, so the right keyboard and autofill appear.',
    'Name an icon button you pass as `trailingIcon` with its own `aria-label`.',
  ],
};
