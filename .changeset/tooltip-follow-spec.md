---
'@windmorph/react': minor
---

Tooltips follow more of the M3 spec: the entry reveal from the anchor's side now runs (it only faded); a persistent rich tooltip closes on a press anywhere outside it, including empty space; tooltips keep their natural width at the screen edge and move inside the margin instead of being squeezed; and icon buttons in a `TopAppBar` or `SearchAppBar` show their tooltips below. The new `TooltipPlacementContext` sets the default placement of the plain tooltips inside.
