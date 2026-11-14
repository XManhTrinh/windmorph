---
'@windmorph/react': patch
---

Fixed: Enter on a day in a date picker dialog saves that day. The day was picked only when the key was let go, after the dialog had already saved, so a `PickerDialog` with `onConfirm` around a `DatePicker` or a `DateRangePicker`, and a `DateField`'s full-screen dialog, closed with the date picked before. The Enter that saves now picks the day as the key goes down.
