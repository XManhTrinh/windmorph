---
'@windmorph/react': patch
---

Fixed: a disabled `Button` or `IconButton` link keeps `role="link"` once its `href` is gone, so assistive technology can still read its name.
