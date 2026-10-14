---
'@windmorph/react': patch
---

The option lists of `Select` and `Autocomplete` are as wide as their field again. They share the menu's reveal, which now keeps its content's width (`w-max`) so a layout class on a menu's outermost element can't stretch it; the option list fills its popover instead, which is at least as wide as the field.
