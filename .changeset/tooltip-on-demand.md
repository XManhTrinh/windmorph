---
'@windmorph/react': patch
---

Icon buttons, FABs, `FabMenu`, `ToolbarFab` and the pickers load the code of their built-in tooltip only when the pointer moves over them or they get focus, rather than up front: about 5 kB gzipped less for `IconButton`, `Fab` and `Toolbar`, and for everything built on icon buttons (`Dialog`, the sheets, `Snackbar`, the pickers, `ButtonGroup`). Names, keyboard focus, touch long press and the tooltip's look and motion are unchanged. `TooltipTrigger` and `Tooltip` are exported as before.
