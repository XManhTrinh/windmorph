---
'@windmorph/react': patch
---

Fix: a standard `SideSheet`'s `classNames.panel` now goes on its visible panel, as on a modal one. It went on the outer layout box with `className`, so a colour, corner or shadow class there painted the wrong box. The outer box keeps `className`.
