---
'@windmorph/react': patch
---

Fixed: `Dialog`, `BottomSheet` and `SideSheet` take their first focus whatever opened them. Opened by a screen reader's click, or by Space on a native input such as a `Switch` or `Checkbox` (a click with no `detail`), they held no focus, which ended on the page. Their first control (or the `autoFocus` one, or a dialog's least destructive action) now takes it at the end of the enter motion, or at once under reduced motion.
