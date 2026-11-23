---
'@windmorph/react': patch
---

Fixed: A full-screen dialog (`fullScreen="always"`, or `"compact"` below 600px) paints `--md-comp-dialog-container-color`, as the basic dialog does, instead of always `surface-container-high`, while it opens too.
