---
'@windmorph/react': patch
---

Fixed: a selected `NavigationRailItem` or `NavigationBarItem` keeps an explicit `aria-current`, for a destination that shows as current without being the page.
