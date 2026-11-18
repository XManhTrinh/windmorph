---
'@windmorph/react': patch
---

Fixed: an overlay opened in a container of the caller's (`Overlay`'s `portalContainer`) or of an app's React Aria `UNSAFE_PortalProvider` carries only the theme attributes that differ from what the container inherits, as in the element in full screen, so an app's own `:root` token values reach a menu or dialog there; it wrote every attribute, which declared the theme's values again. A container that draws none of its children (a `<video>`, `<canvas>` or form control) warns in development. In a menu, Home, End, Page Up and Page Down only move focus: their default no longer scrolls an element around the menu. In a bottom sheet, a menu's first page fades in again as it shows after Back, as its other pages do.
