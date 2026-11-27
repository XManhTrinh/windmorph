---
'@windmorph/react': patch
---

Fixed: A closed menu, dialog, sheet, tooltip or other overlay no longer stays in memory when a transition inside it (a reveal outlasting the fade) is still running as it leaves: the rest is cancelled first.
