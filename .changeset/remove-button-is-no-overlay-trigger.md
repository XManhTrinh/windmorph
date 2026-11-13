---
'@windmorph/react': patch
---

Fixed: a chip's remove button no longer takes the props of an overlay trigger around the chip. Inside a `MenuTrigger`, a `TooltipTrigger` or a dialog's trigger, a `FilterChip` with `onRemove` and an `InputChip` with `onPress` and `onRemove` gave both their buttons the trigger's `id`, `aria-haspopup` and `aria-expanded`, a press on Remove also opened the overlay, and the overlay was placed against the remove button. The chip's main button alone is the trigger now.
