---
'@windmorph/react': minor
---

Added: `useReorder` in `@windmorph/react/primitives`, the engine of a list whose rows a person puts in order: a drag from a row's handle that the row follows while the rows it passes slide aside, moves by action (up, down, to the top or the bottom), cancelling, rows that can't move, and scrolling near an edge. It has no look and no words of its own; the core `List`'s drag-to-reorder will be built on it.
