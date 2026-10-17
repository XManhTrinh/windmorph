# Plan: the docked date picker (`DateField`)

Status: **built on 2026-10-13 in the M3 Expressive spec pass, which was approved as a whole ("fix every spec gap before 0.1.0")**

## Goal

The M3 date picker spec has three variants: the docked date picker, the modal date picker and the modal date input. The library had the last two (`DatePicker` / `DateRangePicker` in a `PickerDialog`). `DateField` adds the first: "The docked date picker displays a date input field by default, and a dropdown calendar appears when the user taps on the input field", and it "works best for medium and expanded breakpoints".

## When to use it

- A date in a form on medium and larger windows, and any date far in the past or future (the spec: "Don't use a modal date picker to prompt for dates in the distant past or future, such as a date of birth. In these cases, use a modal input picker or a docked date picker instead").
- On compact windows, the modal picker in a full-screen `PickerDialog` is recommended instead.

## API

`<DateField label value defaultValue onChange minValue maxValue isDateUnavailable yearRange open defaultOpen onOpenChange supportingText invalid errorMessage required disabled readOnly name calendarIcon strings ref inputRef className style classNames data-* />`

- `value` is a `CalendarDate | null`; `onChange` gets `null` when the field is cleared.
- `label` is required (the spec: the field's accessibility label states its purpose).
- `strings` holds every word: the format hint and its errors (shared with the modal date input), the buttons' names and tooltips, and Cancel / OK.
- `classNames`: `root` (the text field), `input`, `calendar` (the dropdown panel).

## Parts

- **The field** is the modal date input's field (`DateInput`), an outlined `TextField` with no input mask: dashes, spaces, slashes or dots between the parts and an optional leading zero, reformatted on Enter or blur, the locale's format as helper text and placeholder, errors in the supporting text. Its trailing icon button opens the calendar (`aria-haspopup="dialog"`).
- **The calendar** opens just below the field in the select menu's popover (`OptionPopover`): a `surface-container-high` panel, 360px wide, 16px corners, level 3. A 56px row holds the month and year menu buttons, each between previous / next icon buttons with tooltips naming their shortcuts (Page Up / Down, Shift+Page Up / Down). The month or year menu replaces the grid with a list of 48px rows (the chosen one `surface-variant` with a check; years outside `minValue` / `maxValue` disabled); the other menu button is disabled meanwhile. The grid shows the days of the months around in `on-surface-variant`. Cancel and OK end the panel.
- **Keyboard:** the React Aria calendar grid, plus Enter (closes and saves), Shift+M (month menu) and Shift+Y (year menu), from the spec's keyboard table. Months also change with a horizontal swipe.

## Tokens

Compose has no docked date picker, so there is no token file. Colours are the spec's docked colour roles; sizes are the modal picker's (48px cells, 40px days) and the M3 menu's 48px list rows.

## Checks

Vitest (typed entry and errors, opening and confirming, Enter, the menus, Shift+M / Shift+Y, axe), a Storybook story (`Docked`), a Playwright screenshot and a geometry check (360px, below the field, Enter saves).
