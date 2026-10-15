---
'@windmorph/react': patch
---

`FabMenu`, `FloatingToolbar` and `ExtendedFab` are never the browser's scroll anchor (`overflow-anchor: none` on their roots), so opening a FAB menu that reaches above the window, or a toolbar or extended FAB resizing, no longer scrolls the page.
