---
'@windmorph/react': patch
---

A small (`sm`) `SplitButton`'s halves take a 40px minimum height instead of a fixed one, so they grow around large text (250%) instead of letting it overflow, as the XS halves already did.
