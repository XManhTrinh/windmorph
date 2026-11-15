---
'@windmorph/react': patch
---

Fixed: tooltips, menus, sheets and dialogs show while an element is in full screen. They were portalled to `body`, which a browser in full screen doesn't draw; an overlay now goes into the element in full screen (unless it is a video or another element that draws no children). A container given to the overlay, or one an app sets for a subtree with React Aria's `UNSAFE_PortalProvider`, still comes first.
