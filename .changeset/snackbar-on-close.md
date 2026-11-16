---
'@windmorph/react': patch
---

Changed: `Snackbar`'s `onClose` is its close callback, the name `onDismiss` had (which stays as a deprecated alias): given, the snackbar shows its close (×) button, and the button and Escape call it. It used to reach the root element as a DOM attribute and did nothing, so a snackbar that passed `onClose` now shows the close button.
