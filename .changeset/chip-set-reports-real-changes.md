---
'@windmorph/react': patch
---

Fixed: `ChipSet` calls `onSelectionChange` only when the selection changes. A press on the last selected chip of a set with `deselectable={false}` reported the selection it already had.
