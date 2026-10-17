import type { ComponentAccessibility } from './types';

export const datePicker: ComponentAccessibility = {
  keyboard: [
    {
      keys: ['Arrow Left', 'Arrow Right'],
      action: 'Moves to the previous or next day.',
      where: 'In the calendar grid',
    },
    {
      keys: ['Arrow Up', 'Arrow Down'],
      action: 'Moves to the same day of the previous or next week.',
      where: 'In the calendar grid',
    },
    {
      keys: ['Page Up', 'Page Down'],
      action: 'Moves to the same date in the previous or next month.',
      where: 'In the calendar grid',
    },
    {
      keys: ['Shift + Page Up', 'Shift + Page Down'],
      action: 'Moves to the same date in the previous or next year.',
      where: 'In the calendar grid',
    },
    {
      keys: ['Home', 'End'],
      action: 'Moves to the first or last day of the month.',
      where: 'In the calendar grid',
    },
    {
      keys: ['Space'],
      action:
        'Selects the focused day. In a range picker the first day picks the start and the second the end.',
      where: 'In the calendar grid',
    },
    {
      keys: ['Enter'],
      action:
        'Selects the focused day, then closes the calendar and saves it: in the docked calendar always, and in a {@link PickerDialog} given `onConfirm`. A range saves once both ends are picked; otherwise Enter only selects.',
      where: 'In the calendar grid',
    },
    {
      keys: ['Shift + M'],
      action:
        'Moves to the month menu: the docked calendar opens its month list on the current month; the modal picker focuses its month and year button.',
      where: 'In the calendar',
    },
    {
      keys: ['Shift + Y'],
      action: 'Opens the year list with focus on the current year.',
      where: 'In the calendar',
    },
    {
      keys: ['Escape'],
      action:
        'In a range picker, first drops a half-picked range. Otherwise it closes the docked calendar or the dialog without saving.',
      where: 'In the calendar',
    },
    {
      keys: ['Arrow Up', 'Arrow Down', 'Arrow Left', 'Arrow Right'],
      action:
        "Moves between years (three to a row in the modal picker's list) or, in the docked calendar's lists, up and down between months or years. Options outside `min` / `max` are skipped.",
      where: 'In the year and month lists',
    },
    {
      keys: ['Enter', 'Space'],
      action:
        'Chooses the year or month and goes back to the days: the modal picker returns focus to the same day of the chosen year, the docked one to the menu button.',
      where: 'In the year and month lists',
    },
    {
      keys: ['Enter'],
      action:
        'Reads and reformats the typed date. In a {@link PickerDialog} given `onConfirm` it also closes the dialog and saves a usable date (for a range, from the end date field).',
      where: 'In a typed date',
    },
  ],
  keyboardNotes: [
    'Left and right are mirrored in right-to-left layouts, in the grid and in the year list.',
    'The previous and next buttons\' tooltips name their shortcuts ("Previous month (Page Up)", "Next year (Shift+Page Down)"), and so do the month and year buttons\' ("Choose a year (Shift+Y)"). A tooltip describes its button (`aria-describedby`).',
    'The scrolling range picker (`monthLayout="scroll"`) has no month or year menu, so Shift+M and Shift+Y do nothing there.',
    'The typed date has no input mask: it accepts dashes, spaces, slashes or dots and an optional leading zero, and is reformatted only on Enter or when you leave the field.',
  ],
  screenReader: {
    role: 'The month is a `grid` (React Aria `useCalendarGrid`) of day buttons under `columnheader` weekdays. The year and month lists are `radiogroup`s of `radio`s. The docked calendar is a `dialog`, opened from an icon button at the end of a text field.',
    name: 'Each day is named by its full date, and each weekday header by its full name (`abbr`, also shown on hover). The grid is named by the month it shows. The lists are named `labels.yearList` ("Year") and `labels.monthList` ("Month"), the docked calendar `labels.calendar` ("Choose a date"), and the field by its `label`.',
    states:
      'Selected and unavailable days. Years and months are checked or not (`aria-checked`); those outside `min` / `max` are disabled (`aria-disabled`) but stay focusable. The calendar button has `aria-haspopup="dialog"` and `aria-expanded`, and the month and year buttons have `aria-expanded`. A typed date that can\'t be used makes the field invalid, with the reason as its error text.',
    notes: [
      'The headline and the month label are `aria-live="polite"`, so a new selection and a new month are announced.',
      'The locale\'s format ("MM/DD/YYYY") is the field\'s placeholder and helper text.',
      'The drop-down arrows are decorative (`aria-hidden`), and so are the empty cells around each month in the scrolling range picker.',
    ],
  },
  focus: [
    'The docked calendar opens with focus on the selected day (or today), keeps focus inside while open, and returns it to the calendar button when it closes.',
    'In a {@link PickerDialog}, focus is contained in the dialog and returned to what opened it on close.',
    'The grid is one Tab stop: focus moves between days with the keys above. Each year or month list is one Tab stop, on the checked option, with a roving `tabIndex`.',
    "Days, years and months show M3's focus indicator on keyboard focus only: a 3px `secondary` outline 2px outside.",
  ],
  touchTarget: [
    "Days are 40px circles with a 48 × 48px target filling their cell. Years are 72 × 36px pills whose target is 48px tall. The docked calendar's months and years are 48px rows.",
    'The previous, next, mode and calendar buttons are icon buttons with 48 × 48px targets.',
    'A horizontal swipe on the grid pages months; the previous and next buttons and Page Up / Page Down do the same without a gesture.',
  ],
  motion: [
    'Under reduced motion a new month fades in without sliding, the calendar and text input modes swap with a fade only (the height of the picker changes at once instead of on a spring), and the year list fades in without expanding.',
    'A {@link PickerDialog} keeps only its fades under reduced motion.',
  ],
  consumer: [
    'Give the field (`label`) or the dialog (`aria-label`) a name that says what the date is for ("Date of birth", "Check-in").',
    "Keep the format as helper text, or replace `supportingText` with text that still gives the format. Put your own rule's message in `errorMessage` with `invalid`.",
    'Translate every built-in word through `labels`, including the shortcut tooltips, so the keys they name stay right.',
  ],
};
