---
'@windmorph/react': patch
---

Fixed: a `Menu` inside a `MenuTrigger` has one name in the popover and the bottom sheet alike. With its own `aria-label` or `aria-labelledby` it's named by it in both; without, it's named after its trigger in both. The popover read the trigger's name ("More options") while the compact window's sheet read the menu's own ("Settings").
