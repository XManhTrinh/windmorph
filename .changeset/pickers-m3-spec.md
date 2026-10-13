---
'@windmorph/react': minor
---

Date and time pickers follow the M3 Expressive spec.

- New `DateField`: the docked date picker (a typed date field with a calendar below it, month and year menus, previous / next year buttons and the surrounding months' days).
- The typed date (the modal date input and `DateField`) is an outlined text field with no input mask: it accepts dashes, spaces, slashes or dots, reformats on Enter or blur, and shows the locale's format as helper text. `dateFieldStyles` is removed (the field is a `TextField`); `dockedDatePickerStyles` is new.
- Months change with a horizontal swipe and slide in; `DateRangePicker` scrolls a vertical list of months by default (`monthLayout="paged"` keeps paging); days and years have 48px targets; weekdays are column headers; years outside `minValue` / `maxValue` are shown disabled; Shift+M / Shift+Y and tooltips naming the shortcuts.
- `PickerDialog`: `onConfirm` (Enter on a day closes and saves), `fullScreen` (`always` / `compact`, with close and Save at the top), `strings`, `closeIcon`.
- `TimePicker`: the dial's numbers are buttons ("7 hours of 12") you Tab to and press; the selectors take typed digits (role `textbox`, no longer `button`); `layout` (`vertical` / `horizontal` / `auto`, default `auto`) so the picker never scrolls; `defaultMode` / `onModeChange`; 24-hour input fields are 96px wide. New `TimePickerModeToggle` and `useTimePickerRoom`. The dial is now `role="group"` instead of `role="slider"`.
