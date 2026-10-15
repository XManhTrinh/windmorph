---
'@windmorph/react': patch
---

`List` items read their text once: a switch, checkbox or radio item's headline and supporting text already name and describe its input, so the visible copy is hidden from assistive tech. The expand chevron's icon and bare decorative icons in `leading` / `trailing` (an `<svg>` with no name of its own) are hidden too, instead of being listed as unnamed images.
