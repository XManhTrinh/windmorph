---
'@windmorph/react': patch
---

Fixed: a focused chip at either end of a scrolling `ChipSet` (`layout="scroll"`) shows its whole focus ring. The row's 4px padding at each end cut 1px off the 5px ring; it now pads by the ring's own size, and a chip that focus scrolls into the row keeps its ring in view.
