---
'@windmorph/react': patch
---

Under reduced motion, collapsing a `List` item's nested rows fades them out where they are, as expanding fades them in (their height closed in the first frame, so the fade was never seen).
