---
'@windmorph/react': patch
---

Pressing a `Checkbox`, `Radio` or `Switch`, or a `List` item that draws one, no longer scrolls the page when the control is partly above the window: the hidden input is focused with `preventScroll`, so the page stays where it is (it jumped about 430px on phones).
