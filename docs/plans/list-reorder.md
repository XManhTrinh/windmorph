# Plan: putting a list's rows in order

Status: **approved 2026-11-19**, with Windmorph Pro's `ReorderList` plan. Step 1 building.

## Goal

A list whose rows a person puts in order, three ways: dragging a row's handle with a mouse, a finger or a pen; the arrow keys on the handle; and actions with no drag at all (Move up, Move down, to the top, to the bottom). While a row is dragged it follows the pointer and the rows it passes slide out of its way, so the list already shows the order it would have. Each move keeps focus on the moved row.

M3 lists drag-to-reorder as a list behaviour, and the core's `List` lists it as not built. It comes in two steps, on one engine:

1. **The engine, in `@windmorph/react/primitives`:** `useReorder`, with no look of its own. Windmorph Pro's `ReorderList` (rows of an app's own content) is its first user.
2. **The core `List`'s reorder,** on the same engine, with M3's dragged list item. A plan of its own, after step 1 is released.

## What M3 says (read 2026-11-19)

- **m3.material.io, Lists (overview, specs, accessibility):** a list item has a **Dragged** state among its states (with Hovered, Focused, Pressed), and nothing else about reordering: no handle, no drop zone, no reorder colours, no keys.
- **Compose's token files** (androidx-main, material3 29.0.0): `ListTokens` gives the dragged item elevation level 4 and large (16dp) corners; `ReorderListTokens` gives a reorder item `tertiary-container` with `on-tertiary-container` content and a drop zone in `surface-container-low`. These are Compose's, not the spec's: step 2 decides which the core `List` takes, by the spec first.

## Decisions (step 1)

| # | Decision | Value |
|---|---|---|
| 1 | Where | `useReorder` in `@windmorph/react/primitives`: state and handlers, no classes, no words |
| 2 | Its own pointer drag, not the browser's drag and drop | The row itself moves (not a picture the browser draws), a finger drags at once from a handle (no long press), and every word stays the component's (the browser's and React Aria's drag words can't be passed through `labels`) |
| 3 | When a drag starts | Past 4px of movement from the press (as the core's drag-and-click handling and Pro's calendar), so a press that doesn't move stays a press |
| 4 | What moves | The dragged row follows the pointer one to one (`translate`, never the list's own transform); the rows between its place and where it would land move by its height and the gap; the list's order changes only on the drop |
| 5 | The order | Controlled: `onReorder(keys, { key, from, to })` once, on the drop or a move by action. A cancel calls nothing |
| 6 | Cancelling | Escape, a cancelled pointer, the window losing focus, the keys changing during the drag, or an unmount: the row goes back |
| 7 | Rows that can't move | `isMovable(key)` false: a wall a drag can't cross and an action can't pass |
| 8 | Near an edge | The nearest scrolling ancestor, or the window, scrolls while the pointer is within `scrollEdge` (48px) of its edge, faster nearer it |
| 9 | Motion | A move by action, and the settle after a drop, slide the rows from where they were (FLIP) on the spring the caller gives; under reduced motion they change at once |
| 10 | Measuring | Each row's box once at the lift (and after an auto-scroll), never on every frame |

## API (step 1)

```ts
const reorder = useReorder({ keys, listRef, onReorder, isMovable, threshold: 4, scrollEdge: 48 });
// reorder.itemProps(key): data-reorder-key, data-dragged, and the row's offset while dragging
// reorder.handleProps(key): onPointerDown (touch-action: none on the handle is the caller's)
// reorder.move(key, 'up' | 'down' | 'top' | 'bottom'), reorder.canMove(key, where)
// reorder.dragged, reorder.target, reorder.cancel(), reorder.lastMoved
```

## Checks

Unit (pointer events in jsdom with stubbed boxes): under the threshold nothing lifts; past it the row lifts and follows; crossing one row and several; a wall stops it; drop calls `onReorder` once with the right keys; each cancel puts it back and calls nothing; secondary buttons and a second contact are ignored; each action and `canMove` at the ends and at a wall; the keys changing during a drag cancel it. A changeset (`Added:`).
