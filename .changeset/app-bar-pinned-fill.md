---
'@windmorph/react': patch
---

Medium and large top app bars with `scrollBehavior="pinned"` fill with `surface-container` once content scrolls under them, as M3 asks of every app bar (they stayed `surface`). `topAppBarStyles` has a new `pinned` variant.
