---
'@windmorph/react': patch
---

Fixed: links inside a `RouterProvider` with a `useHref` (an app's base path, say) show the router's address, as React Aria's own links do, so opening one in a new tab, copying it or a crawler reaches the right page. `Button`, `IconButton`, `Fab`, `ExtendedFab`, `ToolbarFab`, `Card`, `AssistChip`, `NavigationBarItem`, `NavigationRailItem`, `SplitButton`, `FabMenuItem`, link `ListItem`s and `ButtonBase` showed the raw `href`, though a plain click already went to the right page. A disabled link still has no address.
