---
'@windmorph/react': patch
---

Fixed: a collapsed `FloatingToolbar` or `DockedToolbar` by the window's edge no longer scrolls the page sideways: its hidden leading or trailing content is clipped on the toolbar's axis instead of only hidden.
