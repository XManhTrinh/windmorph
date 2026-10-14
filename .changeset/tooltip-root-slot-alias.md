---
'@windmorph/react': patch
---

`tooltipStyles` and `richTooltipStyles` keep a `root` slot, a deprecated alias of `panel` that resolves to exactly the same classes, so code written against the slot's earlier name keeps working. Use `panel`; `root` is kept for one release.
