---
'@windmorph/react': minor
---

`FabMenu` takes `iconTransition` (`swap`, the default midpoint handover, or `rotate`): with `rotate`, the closed icon turns and fades out while the open icon turns in and fades in, mirrored in RTL and a plain crossfade under reduced motion. It goes beyond the M3 spec and matches Google's Expressive showcase motion. `ToolbarFab` takes `expandedIcon`, shown while its floating toolbar is expanded, with the same `iconTransition` choice. The `IconTransition` type is exported. The unreleased `iconFace`, `closedFace` and `openFace` slots of `fabMenuStyles` are gone; the faces are shared with `ToolbarFab`.
