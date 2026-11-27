---
'@windmorph/react': patch
---

Fixed: a `Select` named by `aria-labelledby` (a heading above it) with no `label` gives that name to its bottom sheet and its searchable list too, as to the field; they had none (an empty `aria-label` on the sheet). A `label` that isn't a string names the sheet the same way, and a searchable list is named by the field's label alone, without the search's "Suggestions".
