---
'@windmorph/react': patch
---

Fixed: a `TopAppBar`'s long top-row title and subtitle end in an ellipsis within their column. Start-aligned or centred, they ran past it, over the icons and out of a narrow parent (a two-row bar's collapsed title too, hidden at rest but still widening the page).
