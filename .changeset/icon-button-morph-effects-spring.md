---
'@windmorph/react': patch
---

`IconButton`'s press and selection morphs run on the default effects spring and never bounce, as Compose's icon buttons ("DefaultEffects is intentional here to prevent any bounce"). `container-motion` reads `--m3-shape-spring-duration` and `--m3-shape-spring-easing` when set, so a component can pick another spring for its corners.
