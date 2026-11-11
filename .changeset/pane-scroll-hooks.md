---
'@windmorph/react': minor
---

Added: `useScrollRestoration` and `useScrollKeys` in `@windmorph/react/primitives`, for a page that is a pane scrolling by itself, as in the app frame block. `useScrollRestoration(ref, { pageKey })` brings the pane's scroll position back on back, forward and reload, which browsers do only for the window, and starts a new page at its top; it works with any router, which passes its path and query as `pageKey`. `useScrollKeys(ref)` sends Page Down, End, Space and the arrows to the pane while nothing has focus, and returns the `tabIndex` for it: a tab stop only on a page with nothing of its own that takes focus.
