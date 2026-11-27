---
'@windmorph/react': patch
---

Fixed: A closed menu, dialog, sheet, tooltip or other overlay no longer stays in memory when a transition inside it (a reveal outlasting the fade) is still running as it leaves: the overlay now leaves once those transitions have ended too, within the 800ms fallback.
