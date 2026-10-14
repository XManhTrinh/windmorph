---
'@windmorph/react': minor
---

The progress indicators have component tokens: `--md-comp-progress-indicator-active-indicator-color`, `-track-color` and `-stop-indicator-color` restyle every linear and circular indicator from CSS, globally, per theme or within any ancestor. Defaults are unchanged, and `className` / `classNames` still win. The roots carry `data-tokens`, the drawn parts `data-slot` (`track`, `indicator`, `stop`), and `progressIndicatorTokenSet` is exported.
