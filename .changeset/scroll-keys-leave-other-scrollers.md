---
'@windmorph/react': patch
---

Fixed: `useScrollKeys` leaves the scroll keys with another scrolling element the person last pressed in, such as a side sheet's content beside the pane. Browsers scroll that element while nothing has focus, and the pane used to take the keys from it. The returned `tabIndex` now counts only what Tab would reach: a hidden input, or a control in an `inert`, `hidden` or disabled part, no longer takes the tab stop away from a page that is otherwise text.
