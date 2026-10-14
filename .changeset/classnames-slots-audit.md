---
'@windmorph/react': minor
---

More parts can be restyled through `classNames`:

- `IconButton`, `Fab`, `ExtendedFab`, `FabMenu` and `ToolbarFab`: `tooltip`, for the built-in tooltip.
- `ButtonGroup` now takes `classNames`: `root`, `overflowButton` and `overflowMenu`. `ButtonGroupClassNames` is exported.
- `Checkbox`: `icon`, the check or dash. `Switch`: `stateLayer`.
- `Slider` and `RangeSlider`: `activeTrack`, `inactiveTrack`, `stop`, `icon` and `handle`.
- `Tabs`: `scroller`, `icon` and `label`.
- `TextField`, `Select` and `Autocomplete`: `outline` and `activeIndicator`. `Select` and `Autocomplete` options: `icon`, `description`, `trailing`, `heading`, `divider` and `empty`.
- `Menu`: `heading`, `icon`, `description`, `shortcut` and `trailingIcon`.
- `BottomSheet`: `handleBar`. Navigation rail and bar items: `stateLayer`.
- `TopAppBar`: `titleText`, `subtitleText`, `expandedTitle` and `expandedSubtitle`.
- `List`: `selectionIndicator` and `expandButton`.
- `DatePicker` and `DateRangePicker`: `title`, `headline`, `weekday`, `day`, `year` and `monthSubhead`. `PickerDialog`: `title`.
- `DateField`: the text field's parts (`label`, `container`, `trailingIcon`, `supportingText`, `errorText`, `errorIcon`, `outline`, `activeIndicator`) and the calendar's `menuButton`, `weekday`, `day` and `item`.
- `TimePicker`: `field`, `fieldLabel`, `separator`, `period` and `periodOption`.
