---
'@windmorph/react': patch
---

`Select`, `Autocomplete` and `DateField` load the code of the list's loading indicator only when it shows (with `loading`), preloading it when a field that takes `loading` is hovered or focused: about 17 kB gzipped less for each. Pass `loading={false}` rather than leaving it out on a field that loads options, so the indicator is ready when it first shows. Nothing else changes.
