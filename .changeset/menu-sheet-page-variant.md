---
'@windmorph/react': patch
---

Changed: a submenu shown in a menu's bottom sheet takes the root menu's `variant`, as a submenu shown in place in a popover does, so all of a menu's pages share one variant and a page never looks different from the one that opened it; it took its own.
