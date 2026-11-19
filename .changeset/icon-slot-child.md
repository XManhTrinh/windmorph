---
'@windmorph/react': patch
---

Fixed: every icon slot (IconButton, Button, FAB and FAB menu, chips, the split button, toolbars, tabs, navigation items, lists, menus, switches and the pickers) fills its icon when it's a single child of any kind, not only a bare `svg`: an icon in a wrapper of its own (an icon with a mark on its corner) shrank to nothing, and only the mark showed. Several children in a slot keep their own sizes.
