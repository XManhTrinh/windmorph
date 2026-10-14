---
'@windmorph/react': minor
---

The tooltips have component tokens: `--md-comp-plain-tooltip-container-color`, `-container-shape` and `-supporting-text-color`, and `--md-comp-rich-tooltip-container-color`, `-container-shape`, `-container-elevation`, `-subhead-color` and `-supporting-text-color` restyle every plain and rich tooltip (and its caret) from CSS, globally, per theme or within a `ThemeScope`. Defaults are unchanged, and `className` / `classNames` still win. Each surface carries `data-tokens`, and `plainTooltipTokenSet` and `richTooltipTokenSet` are exported.
