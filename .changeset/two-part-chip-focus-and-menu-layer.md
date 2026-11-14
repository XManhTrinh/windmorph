---
'@windmorph/react': patch
---

Fixed: a chip that holds its main button (a `FilterChip` with `onRemove`, an `InputChip` with `onPress`) draws that button's focus indicator round the whole chip, and its remove button's inside the button, so an `overflow-hidden` class on the chip no longer cuts them off. With a remove button, such a chip also keeps its pressed layer while a menu opened from it is open, as a chip that is one button does.
