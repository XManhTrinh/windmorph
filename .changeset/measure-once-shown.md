---
'@windmorph/react': patch
---

Fixed: a growing `TextField` (`multiline` with `autoGrow`) first rendered out of sight, as in a closed tab or panel, keeps its height once it shows instead of collapsing to 0px, and a `DateRangePicker` rendered out of sight opens on the range's month once it shows instead of the first month of its year range.
