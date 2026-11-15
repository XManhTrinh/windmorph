---
'@windmorph/react': patch
---

Added: `ThemeScope` takes `as="span"`, so a scope can sit inside a link's or a button's inline content (a dark badge over a picture in a card that is a link) without a `div` there. Everything else works the same, overlays opened inside included.
