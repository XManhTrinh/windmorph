---
'@windmorph/react': patch
---

A `BottomSheet` moving down to its lower detent while staying open (Escape, the handle or the collapse button on a full sheet, or the app lowering a standard sheet) runs on the fast effects spring, as Compose's `partialExpand()` does, so it no longer drops below the detent and bounces back. A drag's settle and the entry keep the spatial spring; under reduced motion detent changes stay instant.
