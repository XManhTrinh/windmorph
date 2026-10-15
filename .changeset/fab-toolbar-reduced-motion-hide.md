---
'@windmorph/react': patch
---

Under reduced motion, hiding a `Fab`, `ExtendedFab` or `FabMenu` (`visible={false}`) and a toolbar leaving on scroll fade out again instead of vanishing on the first frame: `visibility` now waits for the longer of the spatial and effects springs, so it no longer turns `hidden` at once when the spatial springs are instant.
