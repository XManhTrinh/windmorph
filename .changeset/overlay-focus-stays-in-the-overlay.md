---
'@windmorph/react': patch
---

Fixed: Tab inside a dialog opened from a single-select `ButtonGroup` or `ChipSet` stays in the dialog. Focus on a radio button there was taken for focus entering the group, which moved it to the group's selected button, behind the dialog.
