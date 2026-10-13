---
'@windmorph/react': minor
---

`SearchBar` adapts to the window, as M3 recommends: the new default `view="auto"` opens a full-screen search view on compact windows (below 600px wide) and the docked view on larger ones. `docked` and `full-screen` still fix the layout. The resolved view is on the root as `data-view` and passed to the icon functions as `view`, so a back button can show in the full-screen view only. Behaviour change: a bar that relied on the docked default now opens full screen on phones; add a back button for it, or pass `view="docked"`. `SearchBarView` is exported.
