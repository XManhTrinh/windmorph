import type { ComponentAccessibility } from './types';

export const reactionPicker: ComponentAccessibility = {
  keyboard: [
    {
      keys: ['Enter', 'Space'],
      action:
        'Toggles the reaction: picks the default option when there is none, or removes the one picked.',
      where: 'On the button',
    },
    {
      keys: ['Arrow Up', 'Alt + Arrow Down'],
      action: 'Opens the row with focus on the picked reaction, or on the first.',
      where: 'On the button',
    },
    {
      keys: ['Arrow Left', 'Arrow Right'],
      action: 'Moves to the previous or next reaction, wrapping from the last to the first.',
      where: 'In the row',
    },
    {
      keys: ['Home', 'End'],
      action: 'Moves to the first or last reaction.',
      where: 'In the row',
    },
    {
      keys: ['Enter', 'Space'],
      action: 'Picks the focused reaction, closes the row and returns focus to the button.',
      where: 'In the row',
    },
    {
      keys: ['Escape'],
      action: 'Closes the row and returns focus to the button.',
      where: 'In the row',
    },
    {
      keys: ['Tab', 'Shift + Tab'],
      action:
        'Closes the row and leaves it as if it sat right after the button: Shift + Tab lands on the button, Tab on whatever follows it.',
      where: 'In the row',
    },
  ],
  keyboardNotes: [
    'Left and right are reversed in right-to-left layouts.',
    'The pointer ways to open the row (a long press, or resting the mouse on the button) all have this keyboard equivalent.',
  ],
  screenReader: {
    role: 'The button is a toggle `button`. The row is a `toolbar` of `button`s.',
    name: 'The button is named by the reaction it shows: the picked one, or the default option. Each option is named by its `label`; the row by `labels.reactions` ("Reactions").',
    states:
      'The button is pressed or not pressed (`aria-pressed`), expanded or collapsed (`aria-expanded`, with `aria-controls` pointing at the row while it shows), and describes how to open the row with `labels.openPicker` ("Press and hold, or press Alt + Arrow Down, for more reactions").',
    notes: [
      "The icons, and the name shown above the active option on the core's plain tooltip surface, are hidden from assistive tech (`aria-hidden`); the option's name already says it.",
      'In the row, the picked reaction is pressed (`aria-pressed="true"`) as well as filled with `secondary-container`.',
    ],
  },
  focus: [
    'The button is one Tab stop. A keyboard open moves focus into the row, and closing it with Escape or a keyboard pick puts focus back on the button at once, without scrolling the page.',
    "Focus isn't trapped: the row is a non-modal popover, and a press anywhere else closes it. Picking with a pointer leaves focus where it was.",
    "Keyboard focus shows M3's focus indicator on the button and on each option: a 3px `secondary` outline 2px outside.",
  ],
  touchTarget: [
    'The button is 40px tall (`md`) or 32px (`sm`), with an invisible 48 × 48px touch target (`TouchTarget`). Each option in the row is 48 × 48px.',
    'On touch, a long press opens the row and sliding the finger along it then lifting picks the reaction under it.',
  ],
  motion: [
    'Under reduced motion the row only fades in and out instead of also scaling from 80%, and the active option is shown at 1.5× at once instead of growing.',
    'The press ripple appears at full size without growing, and corner changes snap; colours still fade.',
  ],
  consumer: [
    "Give every option a `label` in the app's language: it is the option's name, its tooltip and the button's label once picked.",
    'Translate `labels.openPicker` and `labels.reactions`.',
    "Pick each reaction's `color` from `REACTION_COLORS`: the types accept only those roles, each with 4.5:1 on the button and the row.",
    'In forced-colours mode the button keeps a 1px boundary (`Highlight` when picked, `GrayText` when disabled), the row keeps a border, and the picked option uses `Highlight`; keep `classNames` overrides from removing them.',
  ],
};
