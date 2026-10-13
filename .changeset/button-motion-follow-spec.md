---
'@windmorph/react': minor
---

Buttons follow the M3 Expressive spec. The press morph of every interactive container (buttons, icon buttons, split buttons, FABs, menu items) now moves on the fast spatial spring, and a press that starts while the last morph is still settling uses the fast effects spring instead (`data-rapid-press`), the web's modified curve against rapid-click resonance; the `container-motion-spatial` utility is gone. `Button`: XS buttons have 16px padding and an 8px icon gap, small text buttons 16px padding, and small toggle buttons press to 8px like the others. Breaking: `Button` no longer takes `trailingIcon` (the spec allows one icon, before the label); move the icon to `leadingIcon` or into the label.

`ButtonBase` takes a `dragged` input that sets `data-dragged` (a consumer's own `data-dragged` is no longer overwritten), and `Card` uses it instead of setting the attribute in an effect.
