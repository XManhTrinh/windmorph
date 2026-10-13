---
'@windmorph/react': minor
---

Dialogs follow the rest of the M3 dialog spec: a short dialog is at least 280px wide (narrower only to keep 24px from a small window's edges); a `compact` dialog shown as a basic dialog focuses its first visible control; a scrolling `DialogContent` can be focused and scrolled from the keyboard; `DialogContent dividers` draws the optional dividers; the panel expands away from the edge it sits against (`placement`); reduced motion fades the panel out instead of cutting it; full-screen content is padded 24px at the top and the close icon is `on-surface`; and `origin` grows a full-screen dialog out of a FAB or other element (a container transform). Overlays now take their text direction before their content first styles itself.
