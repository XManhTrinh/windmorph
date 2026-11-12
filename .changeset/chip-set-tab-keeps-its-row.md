---
'@windmorph/react': patch
---

Fixed: leaving a scrolling `ChipSet` with Tab no longer scrolls its row to the far end. Tab goes on from the set's last chip (its first with Shift), which took focus on the way and was scrolled into view.
