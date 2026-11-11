---
'@windmorph/react': patch
---

Fixed: A selected `Menu` item's tick, leading icon, description and trailing icon follow the selected label's token (`--md-comp-menus-standard-menu-item-selected-label-text-color`), in `Select`'s and `Autocomplete`'s option lists too. They were a fixed colour, so an app that set the selected tokens got its label colour and a tick in the old one, which could be invisible against the new container.
