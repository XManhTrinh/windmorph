---
'@windmorph/react': patch
---

The standard `SideSheet` opens and closes by its measured width instead of a grid fraction, so the panel stays on its edge throughout (it floated up to 64px off it mid-animation). Closing it while focus is inside (its close button, or the app) returns focus to where it came from, or to the control before the sheet, instead of the page.
