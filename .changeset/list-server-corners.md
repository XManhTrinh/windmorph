---
'@windmorph/react': patch
---

A plain `List` that mixes loose items and `ListSection`s has the right segmented corners and dividers in its server-rendered HTML, before it hydrates. They now come from CSS, by each item's place among its siblings.
