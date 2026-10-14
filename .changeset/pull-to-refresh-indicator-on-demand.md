---
'@windmorph/react': patch
---

`PullToRefresh` loads its loading indicator's code on demand: when the browser is first idle, or as soon as a finger or mouse goes down at the top of the content, well before a pull shows the indicator. About 17 kB gzipped less for `PullToRefresh` up front. The gesture, the indicator's look and motion, and the announcements are unchanged.
