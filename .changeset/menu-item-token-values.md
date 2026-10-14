---
'@windmorph/react': patch
---

Menu items follow the M3 Menu token files rather than Compose's code: labels are `body-large` (were `label-large`), with 16px of padding at the start and the end (was 12px), a 12px gap between the leading icon and the label (was 8px), and `label-small` trailing text such as a shortcut (was `label-large`). This applies to `Menu` and everything built on it (the split button's menu, `FabMenu` with `presentation="menu"`, the button group's overflow menu) and to `Select`'s and `Autocomplete`'s option lists. Item heights don't change.
