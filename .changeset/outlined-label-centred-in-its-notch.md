---
'@windmorph/react': patch
---

Fixed: an outlined field's floated label sits in the middle of its notch, with 4px of space on each side. The gap in the outline began 1px too far in, and 2px while the field had focus, so the label had 3px before it and 5px after (2px and 6px focused), and the gap moved 1px each time the field took or lost focus. The outline's border now comes out of its padding, so the gap starts 12px from the field's edge at both of the outline's widths (1px, and 2px with focus). It applies to `TextField`, `Select`, `Autocomplete`, `DateField`, `TimeField` and the pickers' text inputs.
