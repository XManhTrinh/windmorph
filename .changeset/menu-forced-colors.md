---
'@windmorph/react': patch
---

In forced colours (Windows high contrast), `Menu` (both layouts), the menus of `Select` and `Autocomplete`, and `DateField`'s calendar panel draw a system-colour outline, since their fill and shadow are dropped and they had no visible edge.
