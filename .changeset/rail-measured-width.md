---
'@windmorph/react': patch
---

Fixed: an expanded `NavigationRail` sizes itself to its labels exactly. A label that only just fit no longer wraps, the rail measures again once the page's fonts load and once a rail hidden by CSS (shown only on wider windows) comes into sight, and a rail that starts expanded is at its width from the first paint instead of springing open.
