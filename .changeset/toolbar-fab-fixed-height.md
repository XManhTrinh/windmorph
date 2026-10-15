---
'@windmorph/react': patch
---

A `FloatingToolbar` with a FAB is a fixed 80px tall (80px wide when vertical), as Compose's layout, so the FAB's spring overshoot no longer grows it by 2px and moves the content after it.
