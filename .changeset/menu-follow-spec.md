---
'@windmorph/react': minor
---

Menus follow the M3 Expressive spec: Tab or Shift + Tab in an open menu or submenu closes every menu and moves focus on from the trigger, instead of leaving the menu open with focus on the page body.

A menu opened with the mouse, and a context menu, focus the first item, as M3 asks (they focused the menu itself); ↑ on the trigger still focuses the last item.

A menu that scrolls shows a persistent scrollbar, the same one as the Select and Autocomplete option lists (it had an overlay scrollbar, hidden at rest).

Under reduced motion a menu only fades in and out; it no longer reveals from its edge.

New `presentation` prop (`popover`, the default, `sheet` or `auto`): a menu can open in a bottom sheet, always or on compact windows, as `Select` can. New `instant` prop: the menu opens and closes with no motion, for dense desktop products. `MenuPresentation` is exported.
