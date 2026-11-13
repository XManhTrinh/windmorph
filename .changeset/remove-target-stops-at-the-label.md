---
'@windmorph/react': patch
---

Fixed: a press on the end of the label of a chip with a remove button no longer removes the chip. The remove button's 48px touch target reached 7px over the label of a `FilterChip` with `onRemove` and of an `InputChip` with `onPress` and `onRemove`, and took the presses there from the toggle or the action. In those chips the target now stops where the label ends: it is 41px wide and 48px tall, and still reaches 7px past the chip's end. An `InputChip` with only `onRemove`, whose label takes no presses, keeps its 48px target.
