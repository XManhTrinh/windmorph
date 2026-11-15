---
'@windmorph/react': patch
---

Added: `controlPlacement="end"` on `Switch`, `Checkbox`, `Radio` and `RadioGroup` puts the control after its label, which grows to fill the row: a settings row with its words at the start and its switch at the end, the whole row being the label. `start` (before the label) stays the default. The same name as `ListItem`'s; the `ControlPlacement` type is exported.
