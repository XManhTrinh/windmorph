---
'@windmorph/react': minor
---

Menu: follow the M3 Expressive spec. New `layout` (`divider`, now the default, or `gap`; a scrolling `gap` menu switches to dividers), `SubmenuTrigger` (submenus with Left / Right keys, an active item and the focused / unfocused corner morph), `ContextMenuTrigger`, `badge` on items and web `density`. Disabled items can take focus, multi-select menus stay open on Enter, the trigger keeps a pressed state layer while its menu is open (`data-menu-open`, also used by the split button), and the menu expands along one axis instead of scaling. To keep the previous grouped look, pass `layout="gap"`.
