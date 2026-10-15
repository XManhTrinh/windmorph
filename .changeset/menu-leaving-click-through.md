---
'@windmorph/react': patch
---

A closing `Menu` (and the menus of `Select`, `Autocomplete` and `DateField`) no longer takes presses while it fades out: an item clicked in its first ~50ms ran its action.
