---
'@windmorph/react': patch
---

Fixed: a modifier key pressed alone no longer shows the focus ring of a control a pointer focused. On a Mac, Option alone (a shortcut's start, a window switcher) counted as keyboard use and left a ring behind; Caps Lock did everywhere. A key that does something, Escape and Tab included, still shows it, and a screen reader's focus keeps its rings.
