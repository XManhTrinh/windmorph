import type { ComponentAccessibility } from './types';

export const select: ComponentAccessibility = {
  keyboard: [
    {
      keys: ['Enter', 'Space', 'Arrow Down'],
      action: 'Opens the menu, with focus on the chosen option or else the first.',
      where: 'On the field',
    },
    {
      keys: ['Arrow Up'],
      action: 'Opens the menu, with focus on the chosen option or else the last.',
      where: 'On the field',
    },
    {
      keys: ['Arrow Left', 'Arrow Right'],
      action: 'Chooses the previous or next option without opening the menu (single selection).',
      where: 'On the field',
    },
    {
      keys: ['A letter'],
      action:
        'Chooses the next option starting with it without opening the menu, as a native select does (single selection).',
      where: 'On the field',
    },
    {
      keys: ['Arrow Up', 'Arrow Down'],
      action: 'Moves between the options.',
      where: 'In the menu',
    },
    {
      keys: ['Home', 'End'],
      action: 'Moves to the first or last option.',
      where: 'In the menu',
    },
    {
      keys: ['A letter'],
      action: 'Moves to the next option starting with it; the same letter again moves on.',
      where: 'In the menu',
    },
    {
      keys: ['Enter', 'Space'],
      action:
        'Chooses the focused option and closes the menu. With `selectionMode="multiple"` it adds or removes the option and the menu stays open.',
      where: 'In the menu',
    },
    { keys: ['Escape'], action: 'Closes the menu.', where: 'In the menu' },
    {
      keys: ['Arrow Up', 'Arrow Down'],
      action: 'Moves through the matching options while focus stays in the search.',
      where: 'Searchable',
    },
    {
      keys: ['Enter'],
      action: 'Chooses the highlighted option.',
      where: 'Searchable',
    },
    {
      keys: ['Escape'],
      action: 'Clears the search, then closes the menu or sheet.',
      where: 'Searchable',
    },
  ],
  keyboardNotes: [
    'Typeahead wraps around to the top of the list.',
    "A `readOnly` field opens no menu, and the arrow keys and typeahead don't change its value.",
  ],
  screenReader: {
    role: 'The field is a `button` with `aria-haspopup` (`listbox`, or `dialog` when `searchable`) and `aria-expanded`. The options are a `listbox` of `option`s, in `group`s under their headings when there are sections. A `searchable` menu is a `dialog` holding a search `combobox` (`aria-activedescendant`) over the listbox.',
    name: 'The field is named by its `label` (with a `*` when `required`) and its value; without a label, by `aria-label`. The listbox, the search dialog and the bottom sheet are named after the field. The search input is named "Search" (`labels.search`).',
    states:
      'Selected or not on each option (`aria-selected`), `aria-multiselectable` with multiple selection, disabled options (`aria-disabled`), and invalid and required on the field.',
    notes: [
      'Supporting text is the field\'s description. An error message replaces it visually and is announced as an alert, while the supporting text stays in the description. An invalid field shows an error icon (`img`) named "Error" (`labels.error`).',
      "With `renderValue` the field shows what you render (a code, a flag) hidden from assistive tech, while screen readers still hear the chosen options' text.",
      'With several options chosen the field reads the first two and a count, "+3" (`labels.more`).',
      'An empty list shows a `status` that is announced: "No options" (`labels.empty`), or "No results" (`labels.noResults`) when a search matches nothing. While `loading`, the list ends in a `progressbar` named "Loading options" (`labels.loading`).',
      'Option icons, the check on chosen options, trailing text and the dropdown arrow are hidden from assistive tech.',
    ],
  },
  focus: [
    "Disabled options take keyboard focus but can't be chosen, as M3 asks of menu items. Options past `maxSelections` are disabled the same way until one is removed.",
    'While the menu is open the rest of the page is hidden from assistive tech. Choosing an option or Escape closes it and returns focus to the field; a press outside closes it and lets focus go, as it would leave any other field.',
    "A `searchable` menu puts focus in its search. A searchable bottom sheet shows the list first, so the on-screen keyboard doesn't cover it, and a tap on the search starts typing.",
    "The field shows focus as a text field does: its indicator line or border thickens to 2px and takes the focus colour. Options show M3's focus indicator drawn inside the row.",
  ],
  touchTarget: [
    'The field is at least 56px tall and opens from a press anywhere on it, with a mouse or a finger.',
    "Options are M3's 44px menu rows, spanning the list's width, and stacked with no gap, so they have no extra touch target; the search field in a `searchable` menu is 48px tall.",
  ],
  motion: [
    "Under reduced motion the menu only fades in and out, without the reveal from the field's edge, and the dropdown arrow turns over without rotating.",
    'In a `searchable` list, options that stay after filtering ease into their new places; under reduced motion they jump.',
  ],
  consumer: [
    'Give the field a visible `label`, or an `aria-label` when there is none.',
    "Pass `textValue` on an option whose content is not plain text, so typeahead, filtering and the field's value can read it.",
    'Translate the built-in words with `labels`: "No options", "Loading options", "Search", "No results", "Error" and the "+N" count.',
    'Use `presentation="auto"` or `"sheet"` for long lists on phones, and `searchable` when people know what they are looking for.',
  ],
};
