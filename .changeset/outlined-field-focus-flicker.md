---
'@windmorph/react': patch
---

Outlined `TextField`, `Select`, `Autocomplete` and date fields no longer flicker on focus: the outline's width now grows to 2px on the fast effects spring, which never overshoots. On the overshooting spatial spring the browser, which draws borders in whole pixels, showed 2px, then 1px for about 100ms, then 2px again.
