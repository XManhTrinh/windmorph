---
'@windmorph/react': minor
---

Submenus work in a `Menu` opened as a bottom sheet (`presentation="sheet"`, or `auto` on a phone). A submenu now takes the menu's place in the sheet, below a back button and its item's label, instead of opening beside its item, where a phone-width sheet had no room. ←, Escape or the back button go back to the item that opened it, and hovering an item no longer opens its submenu in a sheet. New `labels` prop (`MenuLabels`, with `back`) for the back button's name.
