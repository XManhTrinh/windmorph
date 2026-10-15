---
'@windmorph/react': patch
---

When a snackbar with focus in it leaves and the element focus came from is gone, focus moves to the control that followed it in the Tab order (or else the one before it) instead of falling to the page.
