import type { ComponentAccessibility } from './types';

export const pinInput: ComponentAccessibility = {
  keyboard: [
    {
      keys: ['Tab'],
      action: 'Moves focus to the code, one field for all the boxes, and on to the next element.',
    },
    {
      keys: ['Arrow Left', 'Arrow Right'],
      action:
        "Move to the previous or next box. Inside the code, that box's character is selected, so typing replaces it.",
    },
    {
      keys: ['Home', 'End'],
      action: 'Move to the first box, or to the box after the last character.',
    },
    {
      keys: ['Backspace'],
      action:
        'Deletes the character in the active box, or the last one when the caret waits after the code.',
    },
  ],
  keyboardNotes: [
    "Typing a character fills the active box and moves on. Characters the `type` (or `pattern`) doesn't accept are dropped, and letter codes are upper-cased.",
    'Pasting a code cleans it ("123 456" becomes 123456): a full code replaces the value, a shorter one goes in at the caret.',
    'Numeric codes open the number pad on phones (`inputMode="numeric"`).',
    'The boxes read left to right in right-to-left layouts too, and Arrow Left always moves towards the first box.',
  ],
  screenReader: {
    role: 'One text field (`input`): `type="text"`, or `type="password"` with `mask`. The boxes are drawn over it and hidden from assistive tech.',
    name: 'The visible `label`, or `aria-label` or `aria-labelledby` without one.',
    states:
      'Invalid (`aria-invalid`), required, disabled and read-only. The supporting text and the error message describe the field.',
    notes: [
      'The error appears in an `alert` region, so it is announced as it appears. The supporting text stays readable to screen readers while the error replaces it on screen.',
      'With `mask` the field is a password field, so the code is never read aloud.',
      'The separators between groups and the required asterisk are hidden from assistive tech.',
    ],
  },
  focus: [
    'The code is one Tab stop. While it has focus, the active box shows the focus state of an M3 text field (a 2px `primary` border, or `error` when invalid) and an empty active box shows a caret.',
    'A tap or click on a box puts the caret in that box.',
  ],
  touchTarget: [
    'The input covers the whole row of boxes, so any tap on the row lands on it. Boxes are at least 48, 56 or 64px tall (`small`, `medium`, `large`), 4px less a density step (44px at -3 at `medium`), and grow with larger text.',
    'On narrow screens the boxes shrink to fit, down to 32px wide each.',
  ],
  motion: [
    'A new character pops into its box (a scale on the fast spatial spring and a fade on the fast effects spring); the caret blinks as a step, 500ms on and 500ms off; an invalid code shakes the row once, on the default spatial spring.',
    'Under reduced motion the pop is skipped but new characters still fade in, the caret stays on and nothing shakes. Border colours still fade.',
  ],
  consumer: [
    'Give it a visible `label` that says what code to enter and how long it is ("6-digit code"); use `aria-label` only where a visible label is impossible.',
    'Keep `otp` on for codes sent by SMS or email (it sets `autocomplete="one-time-code"`), and turn it off for PINs, with `mask`.',
    'When a code is wrong, set `invalid` with an `errorMessage` that says what to do next.',
    'In forced-colours mode the boxes keep system-colour borders, with the active box in `Highlight`; keep `classNames` overrides from removing them.',
  ],
};
