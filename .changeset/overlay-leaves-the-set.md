---
'@windmorph/react': patch
---

Fixed: chips and toggle buttons in a dialog, menu or sheet opened from inside a `ChipSet` or a `ButtonGroup` are no longer part of that set. A chip in such a dialog was disabled with the set, and one with a `value` joined the set's selection.
