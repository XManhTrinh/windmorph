---
'@windmorph/react': patch
---

`List` no longer imports the whole `Checkbox`, `RadioGroup` and `Switch` modules to draw its checkbox, radio and switch items: it shares just their drawn parts with the controls, about 4 kB gzipped less for every list. Nothing visible changes.
