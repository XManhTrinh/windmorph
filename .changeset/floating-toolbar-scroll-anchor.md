---
'@windmorph/react': patch
---

A vertical `FloatingToolbar` in normal flow no longer scrolls the page by its height change on every collapse and expand. Its root may be the browser's scroll anchor again (its start edge stays put); only its moving parts are excluded.
