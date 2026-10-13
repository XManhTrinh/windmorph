---
'@windmorph/react': patch
---

The expanded docked `SearchBar` field is always 56px tall, as the M3 spec's focused search bar, centred on the collapsed bar. It used to take the collapsed bar's height, so a bar resized shorter opened a short field.
