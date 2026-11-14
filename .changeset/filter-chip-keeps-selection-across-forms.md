---
'@windmorph/react': patch
---

Fixed: a `FilterChip` keeps its selection and keyboard focus when `onRemove` is added or taken away, as an app does to show the remove button only on wider windows. The chip is one button without `onRemove` and a container of two with it, so the toggle was built anew: an uncontrolled chip went back to unselected, and focus fell to the page.
