---
'@windmorph/react': patch
---

Fixed: Escape in an `Autocomplete` with its list open, inside a bottom sheet, closes only the list. It closed a modal sheet along with it, and lowered an expanded standard sheet. A modal bottom sheet now closes on Escape as `Dialog` and `SideSheet` do, only when it is the topmost overlay; a standard sheet leaves an Escape to any control inside it whose popup is open.
