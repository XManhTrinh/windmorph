---
'@windmorph/react': minor
---

FAB, extended FAB and FAB menu component tokens. `Fab`: `--md-comp-fab-<colour>-container-color` and `-icon-color` for the six colour styles, and `--md-comp-fab-container-shape`, `--md-comp-fab-medium-container-shape` and `--md-comp-fab-large-container-shape`. `ExtendedFab`: `--md-comp-extended-fab-<colour>-container-color` and `-label-text-color`, and `--md-comp-extended-fab-{small,medium,large}-container-shape`. `FabMenu`: `--md-comp-fab-menu-close-button-container-shape` and `--md-comp-fab-menu-menu-item-container-shape`. Defaults are unchanged, and `className` still wins. A FAB's root now carries `data-color` and `data-size` (public styling hooks). `fabTokenSet`, `extendedFabTokenSet` and `fabMenuTokenSet` are exported.
