---
'@windmorph/react': minor
---

Added: `href`, `target`, `rel` and `download` on `MenuItem`, which make the item a real link with the item's look, role and keys. A press, Enter or Space follows it and closes the menu, a modified click or the browser's link menu opens it in a new tab or copies its address, and inside a `RouterProvider` a plain click goes through the app's router. A disabled item, or one that opens a submenu, isn't a link.
