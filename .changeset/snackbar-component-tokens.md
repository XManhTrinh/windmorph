---
'@windmorph/react': minor
---

Snackbar has component tokens: `--md-comp-snackbar-container-color`, `-container-shape`, `-container-elevation`, `-supporting-text-color`, `-action-label-text-color` and `-icon-color` restyle every snackbar from CSS, globally, per theme or within any ancestor. Defaults are unchanged, and `className` / `classNames` still win. The root carries `data-tokens`, the action and dismiss buttons `data-slot`, and `snackbarTokenSet` is exported.
