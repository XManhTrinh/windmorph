---
'@windmorph/react': patch
---

Changed: the recipes (`buttonStyles` and every other `*Styles` export) run on tailwind-variants 4, with the same merger as `cn`, so they produce the same classes as before. An app that imports `tailwind-variants` itself can move to 4 too.
