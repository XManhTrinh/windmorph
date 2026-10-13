---
'@windmorph/react': minor
---

Buttons follow the M3 Expressive spec more closely:

- A pressed elevated, filled or tonal button (and split button half) shows the pressed elevation, not the hover one.
- The outlined style's outline is drawn inside the leading and trailing space, so outlined buttons and split button halves are the same size as the other styles. The outline width is the `--m3-button-border` variable, which sets the border and the padding together.
- Toggle buttons take `selectedLeadingIcon`, shown instead of `leadingIcon` while selected.
- A disabled outlined icon button's outline dims to `outline-variant` at 10%, and a selected outlined icon button toggle has no outline, disabled or not.
