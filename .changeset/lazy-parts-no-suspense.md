---
'@windmorph/react': patch
---

A preloaded bottom sheet (`Menu` and `Select` in a sheet) and `ButtonGroup`'s loaded overflow menu open in the same render as the press. They no longer go through `Suspense`, which could hold them back for up to about 300ms after they had loaded.
