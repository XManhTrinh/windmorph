---
'@windmorph/react': patch
---

Buttons, icon buttons and split buttons stay visible in forced colours (Windows high contrast): filled, elevated, tonal and text buttons, and filled and tonal icon buttons, draw a 1px `CanvasText` boundary without changing size, a selected toggle is filled with `Highlight`, and disabled ones are `GrayText`.
