---
'@windmorph/react': patch
---

Fixed: a `ChipSet` with `disabled` disables every chip in it. It reached only the filter chips that take part in a selection, so with the default `selectionMode="none"` the group announced itself disabled (`aria-disabled`) while every chip still worked, and in a set with a selection the assist, suggestion and input chips, and filter chips without a `value`, stayed enabled. Every kind of chip now follows the set, as the controls of a disabled `fieldset` do; a chip's own `disabled` still works in a set that isn't disabled.
