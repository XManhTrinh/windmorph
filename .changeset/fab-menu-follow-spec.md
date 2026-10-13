---
'@windmorph/react': minor
---

The FAB menu follows the M3 Expressive spec: items scroll behind the close button on short windows; `presentation="menu"` opens a standard menu 4px above the FAB for the web and large windows; items are at level 3 and their icon is optional; `FabMenuItem` takes `onAction`, which runs in either presentation; `visible` and `appear` animate the button like a FAB; the large FAB's icon is 32px; and a development warning flags menus with fewer than 2 or more than 6 items. Breaking: the menu always sits on the trailing edge, so `align` and the `FabMenuAlign` type are removed; drop the prop.
