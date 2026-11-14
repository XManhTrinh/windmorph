---
'@windmorph/react': patch
---

Fixed: an `InputChip` with only `onPress` shows its hover, focus and pressed states, darkens its border under keyboard focus, and keeps a pressed layer while a menu opened from it is open. The chip is a container round its action's button, which alone took those states, so the chip showed none of them.
