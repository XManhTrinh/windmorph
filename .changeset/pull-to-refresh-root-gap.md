---
'@windmorph/react': patch
---

A `gap-*` on a flex `PullToRefresh` root, or `space-y-*` on a block one, no longer adds space above the content: the indicator's layer cancels it. On a grid root the layer is a grid item in a row of its own, across every column, so the content keeps its rows and columns, but one row gap appears above it; put the grid on an element inside (`<PullToRefresh><div className="grid gap-4">…</div></PullToRefresh>`).
