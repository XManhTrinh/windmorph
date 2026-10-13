---
'@windmorph/react': minor
---

FABs and extended FABs drop back to their resting elevation while pressed (level 3, or 1 lowered), even with the pointer still over them, as the spec's pressed elevation token asks. A collapsed `ExtendedFab` is icon-only, so it now shows its label in a tooltip on hover and keyboard focus, like `Fab`; it has none while expanded, and `tooltip={false}` turns it off.
