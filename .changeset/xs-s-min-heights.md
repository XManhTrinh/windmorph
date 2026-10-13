---
'@windmorph/react': patch
---

XS and S `Button`s, the XS `SplitButton` and chips take a minimum height instead of a fixed one, so they grow around their text at a large browser font size. Nothing changes at the default font size, and a stretching flex or grid parent doesn't make them taller.
