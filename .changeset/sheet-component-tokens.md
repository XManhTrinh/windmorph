---
'@windmorph/react': minor
---

The sheets have component tokens. Bottom sheets: `--md-comp-sheet-bottom-docked-container-color`, `-container-shape`, `-drag-handle-color`, and `--md-comp-sheet-bottom-docked-modal-container-elevation` / `-standard-container-elevation`. Side sheets: `--md-comp-sheet-side-docked-modal-container-color`, `-container-elevation` and `-container-shape`, `--md-comp-sheet-side-docked-standard-container-color`, and `--md-comp-sheet-side-detached-container-shape`. They restyle every sheet from CSS, globally, per theme or within a `ThemeScope`. Defaults are unchanged, and `className` / `classNames` still win. The sheets carry `data-tokens` and public `data-variant` (and `data-detached`) hooks, the handle and the standard side sheet's panel `data-slot`, and `bottomSheetTokenSet` and `sideSheetTokenSet` are exported.
