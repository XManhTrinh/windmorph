---
'@windmorph/react': patch
---

Fixed: each option of a `RadioGroup` takes presses over its whole 48px touch target. Rows were 40px apart (34px at density -3), so a press on the bottom 4px of one option's control chose the option below. They are now 48px apart, top to top, at every density (8px between rows at the default density, 20px at -3), as a wrapping `ChipSet`'s rows are, so a radio group is 8px taller per option.
