---
'@windmorph/react': patch
---

Fixed: A polite announcement waiting for its live region (a focused button turning pending) writes through the region's own document, so it no longer throws when its page goes away first.
