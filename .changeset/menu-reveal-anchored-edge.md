---
'@windmorph/react': patch
---

`Menu`, its submenus, and the menus of `Select`, `Autocomplete` and `DateField` now open from the edge nearest their anchor: upward when placed above the trigger, sideways for a submenu. Before, every menu grew downward from its top edge, because its closed state was resolved before its placement was known.
