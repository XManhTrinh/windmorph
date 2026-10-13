---
'@windmorph/react': minor
---

`SearchBar` takes `inputProps`: attributes such as `aria-keyshortcuts`, `enterKeyHint`, `autoComplete` or `spellCheck` for both the collapsed and the expanded input. The bar's own role, name, value and popup state always win, and handlers run before the bar's.
