---
'@windmorph/react': patch
---

Fixed: a single-select `ButtonGroup` or `ChipSet` no longer leaves a listener on the document after each press. The listeners kept the group's element in memory after it was gone.
