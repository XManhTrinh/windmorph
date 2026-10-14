---
'@windmorph/react': minor
---

More parts can be restyled through `classNames`:

- `DateRangePicker`: `rangeBand`, on each calendar cell the range band spans. Its slots are typed by the new `DateRangePickerClassNames`, which extends `DatePickerClassNames`.
- `TimePicker`: `dial` is documented: the clock dial in dial mode.
- `SideSheet`: `container`, the outermost element that places the sheet, as on `BottomSheet`.
- `Menu` and `Select`: `sheet`, the bottom sheet's surface when they open in a sheet.
- `FabMenuItem`: `label`, on the item's label, which is now wrapped in a span (no visual change).
