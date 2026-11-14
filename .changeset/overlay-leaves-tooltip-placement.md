---
'@windmorph/react': patch
---

Fixed: a tooltip in a dialog, menu or sheet opened from an app bar opens above its button again, as anywhere outside a bar. The app bar's setting, tooltips below, reached into the overlay, so the dialog's own close button showed its tooltip below it.
