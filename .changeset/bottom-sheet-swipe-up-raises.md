---
'@windmorph/react': patch
---

An upward swipe on the content of a half-open modal `BottomSheet` (or a collapsed standard one) raises the sheet first, as Compose's nested scrolling does, and once it's fully raised the rest of the swipe scrolls the content; before, the content scrolled and the sheet stayed at half.
