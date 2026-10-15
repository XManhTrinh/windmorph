---
'@windmorph/react': patch
---

`NavigationBar` with `scrollBehavior="hide-on-scroll"` settles shown or hidden, whichever is nearer, when the scroll stops part-way, instead of resting half off the screen; and an item focused by a press keeps its focus while the bar scrolls away (the bar becomes inert only once focus leaves it).
