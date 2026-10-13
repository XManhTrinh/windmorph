---
'@windmorph/react': minor
---

A persistent rich tooltip no longer moves focus into itself when it opens: focus stays on the trigger, and the tooltip comes next in the Tab order (trigger, its links and buttons, then the rest of the page; Shift+Tab reverses it) without trapping focus. Escape on the trigger or inside closes it with focus on the trigger.
