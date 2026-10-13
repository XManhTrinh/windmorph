---
'@windmorph/react': minor
---

Text fields, Select, Autocomplete, the date and time pickers and `PickerDialog` follow more of the M3 spec:

- Text field: the prefix and suffix fade on the fast effects spring; the outlined notch opens in step with the label; outline and indicator thickness move on the fast spatial spring and colour on the fast effects spring; the placeholder fades in.
- `Select` and `Menu`: typing a letter (or the same letter again) moves to the next item starting with it, wrapping.
- `Autocomplete`: pressing the field opens the whole list (not with `menuTrigger="manual"`).
- `Select`, `Autocomplete` and `DateField` open and close with the menu's reveal from the field's edge instead of a scale.
- `PickerDialog` full screen: `surface-container-high`, a 56px top row and an `on-surface` close icon (`classNames.close`).
- Date pickers: the input mode is titled "Enter date" / "Enter dates" (`strings.inputTitle`); switching modes animates the new view in; the year list expands as it fades in; a full-screen range header is at least 68px; the range band follows a `ThemeScope`; the docked picker's month and year buttons keep a pressed layer while their list is open.
- `TimePicker`: hover and pressed state layers on the selectors; the hand turns on the spatial spring along the shortest arc and the faces crossfade; numbers under the handle are drawn in `on-primary`; AM / PM is one Tab stop moved with the arrow keys; the time reads left to right in RTL; minute taps and drags snap to five; the inner 24-hour ring ends 74px from the centre; a complete typed hour moves on to the minute.
