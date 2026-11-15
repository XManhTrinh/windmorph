---
'@windmorph/react': patch
---

Fixed: an icon button or FAB in a dialog, menu or sheet opened from a button that has an app's tooltip shows its own label tooltip again. The tooltip trigger reached into the overlay, so a full-screen dialog's Close button and a sheet's close and back buttons showed no tooltip. An overlay now leaves behind every trigger it was opened from, so the action of a rich tooltip whose trigger sits inside a menu trigger no longer takes the menu trigger's props.
