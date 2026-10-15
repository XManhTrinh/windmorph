---
'@windmorph/react': patch
---

`DateRangePicker`: while a new range is being picked, the headline shows its first day and an open end ("Mar 20 – End date", the end from `strings.endDateLabel`), as Compose does, instead of the range being replaced.
