---
'@windmorph/react': patch
---

Fixed: tooltips, menus, sheets and dialogs show while an element is in full screen. They were portalled to `body`, which a browser in full screen doesn't draw; an overlay opened in full screen now goes into the element in full screen (unless it is a video or another element that draws no children, or the whole page) and stays there until it closes, so nothing open is rebuilt as full screen starts or ends, and an element inside an open dialog can go full screen. Its theme follows the element it is drawn in, so an app's own colours still reach it. A container given to the overlay, or one an app sets for a subtree with React Aria's `UNSAFE_PortalProvider`, still comes first.
