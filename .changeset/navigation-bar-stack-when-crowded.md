---
'@windmorph/react': patch
---

`NavigationBar` with `iconPosition="start"` stacks its items, sharing the width equally, whenever their labels don't fit on one line side by side (a narrow bar or text at up to 2× its size), so labels are no longer cut short with an ellipsis. The bar carries `data-stacked` while it does.
