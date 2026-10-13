---
'@windmorph/react': patch
---

Chips follow more of the M3 spec: elevation never shows a press (an elevated chip stays at level 1 and a selected flat filter chip at 0 while pressed or keyboard-focused), an elevated selected filter chip rises to level 2 on hover, a keyboard-focused flat chip's border darkens (`on-surface` for assist and suggestion, `on-surface-variant` for filter and input), padding counts from the chip's edge so the 1px border no longer adds to it, the remove button's close icon is hidden from assistive tech, and removing the focused chip in a `ChipSet` moves focus to the next chip, the previous one, or the set.
