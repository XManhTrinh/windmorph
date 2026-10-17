import type { ComponentAccessibility } from './types';

export const autocomplete: ComponentAccessibility = {
  keyboard: [
    {
      keys: ['Tab'],
      action:
        "Moves focus to the input. Chips' remove buttons come before it; the arrow and clear buttons are left out of the Tab order.",
    },
    {
      keys: ['Arrow Down', 'Arrow Up'],
      action:
        'Opens the menu on the first or last match, then moves through the matches while focus stays in the input.',
    },
    {
      keys: ['Enter'],
      action:
        'Chooses the highlighted option. With `selectionMode="multiple"` it adds or removes it, and the menu stays open.',
    },
    {
      keys: ['Escape'],
      action:
        "Closes the menu and puts back the chosen option's text, or empties the input when nothing is chosen.",
    },
    {
      keys: ['Backspace'],
      action: 'In an empty input, removes the last chip.',
      where: 'Multiple selection',
    },
  ],
  keyboardNotes: [
    'Typing opens the menu and filters it, ignoring case and accents by default. Keyboard focus alone does not open it; a press on the field does.',
  ],
  screenReader: {
    role: 'The input is a `combobox` with list autocomplete (`aria-autocomplete="list"`), controlling a `listbox` of `option`s, in `group`s under their headings when there are sections.',
    name: 'Its `label` (with a `*` when `required`), or `aria-label` without one. The arrow button is named "Show options" (`labels.showOptions`), the clear button "Clear" (`labels.clear`), and each chip\'s remove button "Remove" followed by the chip ("Remove London", `labels.remove`).',
    states:
      'Expanded or collapsed (`aria-expanded`), the highlighted option (`aria-activedescendant`), selected and disabled options, and invalid and required on the input.',
    notes: [
      "When the menu opens or the matches change, the number of options is announced; on Apple devices the highlighted option and a new choice are announced too. These live-region messages are React Aria's own, in the app's locale.",
      'An empty list shows a `status` that is announced: "No results" (`labels.noResults`). While `loading`, the list ends in a `progressbar` named "Loading options" (`labels.loading`).',
      'While the menu is open, only the input and the menu are exposed to assistive tech; close it with Escape to reach the chips.',
      'Supporting text is the field\'s description. An error message replaces it visually and is announced as an alert, and an invalid field shows an error icon (`img`) named "Error" (`labels.error`).',
    ],
  },
  focus: [
    "Focus stays in the input while the menu is open; the options are highlighted, not focused. Disabled options can be highlighted but can't be chosen, as M3 asks of menu items, and so can options past `maxSelections`.",
    'The arrow and clear buttons keep focus in the input when pressed. Clearing puts focus back in the input.',
    'The field shows focus as a text field does: its indicator line or border thickens to 2px and takes the focus colour. Options show focus drawn inside the row.',
  ],
  touchTarget: [
    'The field is at least 56px tall. The arrow and clear buttons are 40px, with an invisible 48 × 48px touch target.',
    "Options are M3's 44px menu rows, spanning the list's width and stacked with no gap, so they have no extra touch target.",
  ],
  motion: [
    "As the list filters, the options that stay ease into their new places on the default spatial spring; under reduced motion they don't move.",
    "Under reduced motion the menu only fades in and out, without the reveal from the field's edge, and the dropdown arrow turns over without rotating.",
  ],
  consumer: [
    'Give the field a visible `label`, or an `aria-label` when there is none.',
    'Translate the built-in words with `labels`: "No results", "Loading options", "Show options", "Remove", "Clear" and "Error".',
    'Set `loading` while options load for what was typed, so the list says it is loading rather than showing "No results".',
    "Pass `textValue` on an option whose content is not plain text, so filtering and the input's text can read it.",
  ],
};
