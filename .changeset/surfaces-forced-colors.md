---
'@windmorph/react': patch
---

`Dialog`, `Snackbar`, `Tooltip` and `RichTooltip` keep a visible edge in forced colours (Windows high contrast): their surfaces draw a 1px system-colour outline, and a tooltip's caret is hidden instead of turning into a solid bar.
