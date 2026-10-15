---
'@windmorph/react': patch
---

`SearchBar`:
- A closing view no longer takes presses: for about half a second after Escape, a press on the bar could run a suggestion of the invisible docked dropdown.
- Two trailing icon buttons sit 8px apart, so their 48px touch targets no longer overlap and the first stays 4px from the text.
- Icon buttons in the leading and trailing slots take the slot's colour and the `--md-comp-search-bar-leading-icon-color` / `-trailing-icon-color` tokens; the full-screen Back button is now `on-surface`.
- In forced colours the pill and the docked dropdown draw a system-colour border.
