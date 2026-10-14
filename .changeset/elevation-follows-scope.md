---
'@windmorph/react': patch
---

Elevation shadows follow a `ThemeScope`'s shadow colour. The `--md-sys-elevation-level-*` tokens were declared only on `:root`, where they resolved `--md-sys-color-shadow` once, so a scope (or an overlay opened from it) with its own shadow colour kept the root's. They are now declared on `:root, [data-theme]`, with the same values, so they resolve in each theme scope; override a level on those selectors too.
