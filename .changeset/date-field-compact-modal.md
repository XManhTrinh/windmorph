---
'@windmorph/react': patch
---

`DateField` opens the modal date picker in a full-screen dialog on compact windows (below 600px), as M3 recommends, instead of the 360px docked calendar, which didn't fit a phone: its header was cut off and its day targets overlapped. Save keeps the picked day; the close button drops it.
