---
'@windmorph/react': patch
---

Added: a `MenuGroup` can be a group of choices beside the menu's plain actions: it takes `selectionMode`, `selectedKeys`, `defaultSelectedKeys`, `onSelectionChange` and `deselectable` for its own items, which become radio or checkbox items with a selection of their own, while the menu's other items stay actions that close it. Closing follows the group's mode, as a whole selectable menu's does.
