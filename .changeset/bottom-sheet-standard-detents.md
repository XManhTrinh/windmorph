---
'@windmorph/react': minor
---

A standard `BottomSheet` can open expanded and collapse to its peek: new `detent` (controlled), `defaultDetent` (uncontrolled, `"collapsed"` by default) and `onDetentChange` props take `"collapsed"` or `"expanded"`, as Compose's `rememberStandardBottomSheetState(initialValue)` and `SheetState.expand()` / `partialExpand()` do. The handle (a press, Enter or Space, or a drag), Escape and the collapse button report their moves through `onDetentChange`. A modal sheet ignores them. `BottomSheetDetent` is exported. A standard sheet no taller than its peek height now reports `data-detent="expanded"`.
