---
'@windmorph/react': patch
---

A plain `Button`'s press morph and `SplitButton`'s corner morphs run on the default effects spring and no longer bounce, as Compose's `Button` and `SplitButton`. Toggle buttons keep the fast spatial spring of Compose's `ToggleButton`.
