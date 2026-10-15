---
'@windmorph/react': patch
---

The built-in tooltips of `Fab`, a collapsed `ExtendedFab` and a closed `FabMenu` no longer describe the FAB (`aria-describedby`): they repeat its accessible name, which screen readers announced twice. The tooltip still shows, as an `IconButton`'s does.
