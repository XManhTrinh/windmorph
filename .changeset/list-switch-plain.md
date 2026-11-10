---
'@windmorph/react': patch
---

Fixed: a switch `ListItem` that's on no longer fills with the selected colours: it stays plain, as a settings row, with only its switch showing the state, and the whole row is still the control. Checkbox and radio items keep the fill. `selectedWhenChecked` picks either look per item, and the selected item's text and icon colours are now tokens (`--md-comp-list-list-item-selected-*-color`).
