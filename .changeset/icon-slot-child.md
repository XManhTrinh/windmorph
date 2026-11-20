---
'@windmorph/react': patch
---

Fixed: the icon slots (IconButton, Button, FAB and FAB menu, chips, the split button, toolbars, tabs, navigation items, menus, switches, sliders, TextField, the search bar's leading icon, dialogs, list media and selection checks, and the pickers) now also size a single child that holds an `svg` directly, not only a bare `svg`: an icon in a wrapper of its own (an icon with a mark on its corner) shrank to nothing, and only the mark showed. Any other child keeps its own size: a `BadgedBox` keeps its 24px icon and its badge on the icon's corner, a letter or emoji stays centred, and in TextField's icons and the search bar's leading icon an app's own link or button keeps its size. A list item's leading and trailing slots, the search bar's trailing slot and `BadgedBox`'s anchor still size only a bare `svg`, since they hold media, avatars and controls of their own size.
