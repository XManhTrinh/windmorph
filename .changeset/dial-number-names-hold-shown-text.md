---
'@windmorph/react': patch
---

Fixed: TimePicker's dial numbers are named with the number as shown ("05 minutes of 60", "00 hours of 24"), so each name holds its visible text (WCAG 2.5.3). `labels.dialValue` now receives the number as the dial shows it.
