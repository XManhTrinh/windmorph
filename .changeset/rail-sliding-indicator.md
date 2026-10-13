---
'@windmorph/react': minor
---

`NavigationRail` takes `indicatorMotion="slide"`: while the rail is expanded (in place or as the modal sheet), the current item's pill slides from the previously chosen item to the new one on the fast spatial spring, changing width on the way, as in Google's Expressive showcase. It's an extension beyond the M3 spec, which expands the indicator from the centre of the icon; that stays the default (`expand`). The collapsed rail always expands in place, and under reduced motion the pill fades in place.
