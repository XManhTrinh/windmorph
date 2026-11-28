---
'@windmorph/react': patch
---

Fixed: a `Select` given both `aria-label` and `aria-labelledby`, or a `label` and `aria-labelledby`, names its searchable list, that list's dialog and its bottom sheet as it names its plain list, so every part reads one name.
