---
'@windmorph/react': patch
---

Fixed: in a scrolling `ChipSet`, the arrow keys bring the whole of a chip with a remove button into view, its focus indicator included. Only the button that took focus was revealed, so the chip's other end could stay past the row's edge.
