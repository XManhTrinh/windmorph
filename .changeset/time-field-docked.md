---
'@windmorph/react': minor
---

Added: `TimeField` takes `presentation="docked"`: on windows 600px wide or more, its clock opens a list of times under the field instead of the dialog, for forms with many times. The list holds every `step` minutes (a new prop, 30 by default) within `min` and `max`, opens on the field's time, and a press or Enter picks a time and closes it; any other time can still be typed, and narrower windows keep the dialog. `classNames.list` and `classNames.option` style it. The dialog stays the default.
