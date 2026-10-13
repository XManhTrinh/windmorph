---
'@windmorph/react': patch
---

Snackbars are announced reliably: `SnackbarHost` puts its live region on the page empty and adds snackbars once screen readers have registered it, so one shown at launch is announced; and a `Snackbar` rendered without a host announces its message politely itself.
