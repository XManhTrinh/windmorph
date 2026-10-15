---
'@windmorph/react': patch
---

`Autocomplete` opens when any part of the field is pressed (its padding, the space around input chips, or a chip's label), as `TextField` and `Select` do. Before, only the input's own 24px band reacted, so most of the field ignored presses.
