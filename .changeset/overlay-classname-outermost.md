---
'@windmorph/react': patch
---

Overlays take `className` and `style` on their outermost element, so a layout class (`fixed`, `absolute`, `static`, `overflow-hidden`, `w-full`, a transform) moves the whole overlay and never hides, clips or stretches its surface:

- `Dialog`: `className` and `style` go on a new full-window layer around the positioner, which an inline `position: fixed` keeps over the window whatever the class; `PickerDialog`: `className` too. `classNames.positioner` still styles the positioner.
- `Menu` (and a submenu's `Menu`): `className` and `style` go on the box React Aria places against the trigger, or on the bottom sheet's outermost element in a sheet. The menu inside keeps its own width.
- `Tooltip` and `RichTooltip`: `className` goes on the box React Aria places; the surface inside keeps its size. On menus and tooltips, the insets React Aria leaves unset are reset to `auto` (through `data-overlay-placement` and a rule in the stylesheet), so a consumer inset such as `bottom-4` can't stretch the box or move the surface off its anchor.
- `BottomSheet` and a modal `SideSheet`: `className` and `style` go on the container that places the sheet; the sheet now moves on a layer inside it, so a consumer `translate` or `rotate` never fights its motion.

Style each surface with `classNames.panel`: it is new on `Menu`, and replaces `classNames.root` on `Tooltip` and `RichTooltip` (whose style definitions now have `positioner` and `panel` slots). `ref`, `data-*` and other attributes stay on the surface. The `tooltip` slots of `IconButton`, `Fab`, `ExtendedFab`, `FabMenu` and `ToolbarFab`, `ButtonGroup`'s `overflowMenu` and `FabMenu`'s `menu` style the built-in overlay's surface.
