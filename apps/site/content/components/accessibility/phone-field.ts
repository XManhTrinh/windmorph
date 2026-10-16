import type { ComponentAccessibility } from './types';

export const phoneField: ComponentAccessibility = {
  keyboard: [
    {
      keys: ['Tab'],
      action: 'Moves focus to the country field, then to the number.',
    },
    {
      keys: ['Enter', 'Space', 'Arrow Down', 'Arrow Up'],
      action: 'Open the country list.',
      where: 'On the country field',
    },
    {
      keys: ['Arrow Left', 'Arrow Right'],
      action: 'Choose the previous or next country without opening the list.',
      where: 'On the country field',
    },
    {
      keys: ['A letter'],
      action: 'Chooses the next country whose name starts with it, without opening the list.',
      where: 'On the country field',
    },
    {
      keys: ['Arrow Down', 'Arrow Up'],
      action: 'Move through the countries while focus stays in the search.',
      where: 'In the country list',
    },
    {
      keys: ['Enter'],
      action: 'Chooses the highlighted country and closes the list.',
      where: 'In the country list',
    },
    {
      keys: ['Escape'],
      action: 'Clears the search, then closes the list.',
      where: 'In the country list',
    },
  ],
  keyboardNotes: [
    'Type in the search to filter by name (accents ignored), ISO code or dialling code: "thai", "TH" and "66" all find Thailand.',
    "The number is a plain text field: typing, paste and the browser's own keys work as usual. A pasted or autofilled `+…` number picks its country.",
  ],
  screenReader: {
    role: 'A `group` of two fields side by side: the country field is a {@link Select} trigger (`button` with `aria-haspopup="dialog"`) and the number is a text field (`input type="tel"`).',
    name: 'The group is named by `label` (or `aria-label`). The country field is named by the chosen country with its dialling code as shown, then `labels.country` ("United Kingdom, +44 Country"), so its name contains the visible code (WCAG 2.5.3). The number is named by `label`, or by `aria-label` without one.',
    states:
      'Both fields are marked invalid together. `disabled` disables both; `readOnly` makes the number read-only and keeps the country field enabled, showing its country without opening. `required` applies to the number. The supporting text and the error describe the number.',
    notes: [
      'Each country in the list is an option read as its name and dialling code. The suggested and all-countries groups are named by `labels.suggested` and `labels.allCountries`.',
      'When nothing matches the search, the list says `labels.noResults`.',
      'Without `invalid`, the field checks the number when it loses focus; an invalid one shows `errorMessage` (or `labels.invalid`) in an `alert` region, so it is announced.',
    ],
  },
  focus: [
    "On medium windows and up the list opens in a menu under the field with the search focused. On compact windows it opens in a bottom sheet with the list first, so the on-screen keyboard doesn't cover it.",
    'After a choice or Escape, focus returns to the country field, and the number is next in the Tab order. A press outside the list closes it and lets focus go.',
    "Both fields show M3's text field focus state.",
  ],
  touchTarget: [
    "Both fields are 56px tall at density 0, down to 44px at -3 (`density`, or the theme's); the country list's rows lose 4px a step too. The search in the list stays 48px tall.",
    'The field is 20rem wide (at least 320px), so larger text grows it instead of cutting the label short.',
  ],
  motion: [
    "The country field's arrow turns as the list opens; under reduced motion it flips at once. The menu then only fades, and options don't slide as the search filters them.",
  ],
  consumer: [
    'Give it a visible `label` ("Phone number"); use `aria-label` only where a visible label is impossible.',
    "Pass `labels` from your translations: the country field's name, the search, the group names, the empty message and the error.",
    "Pass `defaultCountry` (the visitor's, when known) and `priorityCountries`, so most people find their country at the top.",
    'When the server rejects a number, set `invalid` and an `errorMessage` that says how to fix it.',
  ],
};
