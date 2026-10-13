---
'@windmorph/react': minor
---

Badge follows the M3 Expressive spec: badges are announced to assistive tech (a count is read, a small badge reads "New notification", changeable with `labels`, and `label` replaces either), numeric content is formatted for the locale and capped at `max` (999, so "999+"), and text badges stop at 34px wide and truncate. `badgeStyles` now has `root` and `label` slots; call `badgeStyles({ size }).root()` where you called `badgeStyles({ size })`.
