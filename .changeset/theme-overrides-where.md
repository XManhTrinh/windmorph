---
'@windmorph/react': patch
---

Fix: a plain rule now overrides a theme's colour roles. The generated theme selectors are wrapped in `:where()`, so `:root { --md-sys-color-primary: … }` or `[data-theme='ocean'] { … }` wins in every mode and contrast level; before, only a rule matching `data-theme`, `data-mode` and `data-contrast` together applied. Built-in and `createTheme()` themes resolve exactly as before.
