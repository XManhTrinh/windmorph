---
'@windmorph/react': patch
---

`getM3Spring`, `buttonGroupStyles` and, from `/primitives`, `getMorph`, `morphPathAt` and `localeWithDirection` can now be called in a React Server Component. They lived in `"use client"` modules, so a Server Component received client references it couldn't call.
