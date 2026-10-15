---
'@windmorph/react': patch
---

Modal bottom and side sheets move initial focus to their first interactive element (the drag handle, or the side sheet's first icon button), as `Dialog` does, instead of the panel. A collapsed standard `BottomSheet` makes the content below its peek `inert`, so Tab and screen readers reach only what's on screen; collapsing it with focus in that part moves focus to the drag handle.
