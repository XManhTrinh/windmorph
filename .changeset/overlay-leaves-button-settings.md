---
'@windmorph/react': patch
---

Fixed: buttons in a dialog, menu or sheet opened from inside a `ButtonGroup`, a toolbar, an app bar or a search bar no longer take that container's button settings (`Overlay` resets `ButtonContext`). A button in a dialog opened from a `ButtonGroup` took the group's size, shape, variant, `disabled` and connected corners, and an icon button in one opened from a toolbar, an app bar or a search bar was `standard` at density 0. They are now as anywhere else on the page: pass `variant="standard"` to an icon button there to keep that look.
