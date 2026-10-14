---
'@windmorph/react': patch
---

`Menu` and `Select` load their bottom sheet only when they first open in one (`presentation="sheet"`, or `"auto"` on a compact window), preloading it when the trigger is hovered or focused. A menu that opens as a popover, and every component built on `Menu` (`SplitButton`, `FabMenu`, `ButtonGroup`'s overflow menu), no longer carries the sheet's code: about 15 kB gzipped less for `Menu` and 17 kB less for `Select`. Keyboard behaviour, focus, roles and first-item focus are unchanged.
