---
'@windmorph/react': patch
---

`ButtonGroup` loads its overflow menu only once a button folds into it. A group without `overflow`, or whose buttons all fit, no longer carries `Menu`'s code: about 9.5 kB gzipped less for `ButtonGroup`. Keyboard behaviour, focus, roles and measurements are unchanged. `MenuTrigger` and `ContextMenuTrigger` now live in their own module and are still exported as before.
