---
'@windmorph/react': patch
---

Connected `ButtonGroup`s lay their buttons out as equal grid columns. A group sized by its content (`w-fit`) gives every button the widest one's natural width, so a longer label keeps its full padding instead of resting squeezed; a group with a definite width shares it truly equally (icon buttons no longer get less than labelled ones). Connected icon buttons take their width as a minimum so the columns can stretch them. To size connected buttons by their labels, use `auto-cols-auto` on the group (it replaces `*:basis-auto`). While the press bump runs the group carries `data-pinned`.
