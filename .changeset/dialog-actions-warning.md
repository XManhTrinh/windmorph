---
'@windmorph/react': patch
---

`DialogActions` warns once in development when it holds more than two actions, as M3 dialogs have at most two (no third such as "Learn more"). Production builds stay silent.
