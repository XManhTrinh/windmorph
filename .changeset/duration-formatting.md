---
'@windmorph/react': patch
---

Added: `ListItemVideo`'s `duration` takes seconds, shown as a clock in the page's digits ("4:12", "1:02:03") and read in words ("Length 4 minutes, 12 seconds", `labels.duration` or the `LabelsProvider`'s `ListItemVideo` key); a string is still shown and read as written. `formatClock` and `formatDurationWords` in `@windmorph/react/primitives` say a media's length the same way anywhere.
