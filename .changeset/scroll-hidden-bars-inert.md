---
'@windmorph/react': patch
---

A `TopAppBar` scrolled fully off screen (`enter-always`, or a small bar's `exit-until-collapsed`) and a `NavigationBar` hidden by `hide-on-scroll` are now `inert`: Tab and screen readers skip their hidden controls until the bar comes back. While keyboard focus is in either bar it stays on screen, and focusing a partly hidden bar brings it back.
