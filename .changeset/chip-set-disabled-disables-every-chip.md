---
'@windmorph/react': patch
---

Fixed: a `ChipSet` with `disabled` disables every chip in it. It reached only the filter chips that take part in a selection, so with the default `selectionMode="none"` the group announced itself disabled (`aria-disabled`) while every chip still worked. In a set with a selection, the assist, suggestion and input chips, and filter chips without a `value`, stayed enabled; they are disabled now too, and a chip cannot opt out, so keep one that must stay usable, such as a chip that clears the filters, outside the set. A set inside a disabled set is disabled as well. A chip's own `disabled` still works in a set that isn't disabled.
