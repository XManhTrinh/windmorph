---
'@windmorph/react': minor
---

Dialog has component tokens: `--md-comp-dialog-container-color`, `-container-shape`, `-container-elevation`, `-headline-color`, `-supporting-text-color` and `-with-icon-icon-color` restyle every basic dialog from CSS, globally, per theme or within a `ThemeScope`. Defaults are unchanged, a full-screen dialog keeps its own container, and `className` / `classNames` still win. The panel carries `data-tokens`, the icon, title and content `data-slot`, and `dialogTokenSet` is exported.
