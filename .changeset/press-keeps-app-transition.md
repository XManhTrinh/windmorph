---
'@windmorph/react': patch
---

Fixed: Pressing an `IconButton`, `Button` or any other pressable component no longer upsets a transition the app adds through `className`, such as a width that grows. While the press's ripple ran, that transition took the ripple's 150ms spring instead of its own duration and easing, and a press while it was still running made it jump to its end.
