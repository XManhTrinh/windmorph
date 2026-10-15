---
'@windmorph/react': patch
---

Stacked `DialogActions` (when they don't fit on one line) are rendered in their visual order, the confirming action first, so Tab and screen readers go top to bottom; on one line they keep their authoring order. The picture is unchanged. `DialogActions` marks the stacked state with `data-stacked`.
