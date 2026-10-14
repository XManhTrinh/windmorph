---
'@windmorph/react': patch
---

A `gap-*` or `space-y-*` class on a `PullToRefresh` root no longer adds space above the content. The indicator's layer cancels the root's gap, and in a grid it takes a row of its own, so the content keeps its rows and columns.
