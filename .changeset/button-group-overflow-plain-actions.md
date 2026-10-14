---
'@windmorph/react': patch
---

Fix: in `ButtonGroup`'s overflow menu, only folded toggle buttons show and announce a checked state. Actions stay plain menu items that close the menu; before, a folded toggle made every item in the menu checkable.
