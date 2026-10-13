---
'@windmorph/react': patch
---

Sliders ignore inset icons on sizes xs and sm, with a development warning, as M3 advises; a disabled slider's handle takes its colours from the nearest `ThemeScope` and colour mode instead of the root theme.
