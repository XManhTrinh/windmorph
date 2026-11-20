import type { ComponentAccessibility } from './types';

export const reorderList: ComponentAccessibility = {
  keyboard: [
    {
      keys: ['Tab', 'Shift + Tab'],
      action: "Moves to a row's handle, then the row's own controls.",
    },
    {
      keys: ['Arrow Up', 'Arrow Down'],
      action:
        'On a handle: moves the row one place; focus stays on its handle. At an end nothing happens, quietly.',
    },
    { keys: ['Home', 'End'], action: 'On a handle: moves the row to the top or the bottom.' },
    {
      keys: ['Enter', 'Space'],
      action:
        'On a handle: opens the move menu (Move up, Move down, Move to top, Move to bottom); nothing with `moveMenu={false}`.',
    },
    { keys: ['Escape'], action: 'While a pointer drags a row: puts it back.' },
  ],
  keyboardNotes: [
    'The handle takes Up, Down, Home and End before its menu would, so they move the row; its description says so.',
    "Each handle is its own tab stop, so a screen reader's browse mode reaches every one.",
  ],
  screenReader: {
    role: 'A `list` (a `ul` with `role="list"`), each row a `listitem`. The handle is a button; with the move menu it reports `aria-haspopup="menu"` and `aria-expanded`.',
    name: 'The list takes `aria-label` or `aria-labelledby` (one is required). Each handle is named from its row\'s `textValue` ("Reorder Simmer", `labels.handle`) and described as "Drag, or press the Up and Down arrow keys, to move it" (`labels.handleDescription`).',
    states:
      'Every move is said politely: "Simmer moved to position 2 of 5" (`labels.moved`), each time for a key or a menu item, once on the drop for a drag, and "Simmer was put back" for a cancelled drag (`labels.cancelled`). Nothing on mount or for your own changes to the order.',
    notes: [
      'No `aria-grabbed`, `aria-dropeffect` or `aria-roledescription`: the words say what happened.',
      "A disabled list's handles are disabled buttons, out of the tab order.",
      'The announcements come from a live region mounted with the list, so the first one is read.',
    ],
  },
  focus: [
    "After any move, focus is on the moved row's handle (or your own control in it, with `useReorderListItem()`), and the row is brought into view no further than needed. Focus never falls to the page.",
    'A row that leaves with focus in it hands focus to the row that took its place, else the one before, else the list.',
    "The handle shows the core icon button's focus ring on keyboard focus.",
  ],
  touchTarget: [
    'Each handle is a 40px icon button with a 48px touch target.',
    'The move menu is the route without a drag (WCAG 2.5.7); keep it, or give every row a menu of its own.',
  ],
  motion: [
    'Rows making room slide on the default spatial spring; the lift fades its colour and shadow on the fast effects spring.',
    "Under reduced motion nothing slides: rows change places at once, and the lift's colour and shadow still fade.",
  ],
  consumer: [
    'Name the list, and give each row a `textValue` that names it in the handle and the announcements.',
    "Keep the order in state and give `onReorder`'s keys back; to refuse a move, give the old order back.",
    'With `moveMenu={false}`, put a menu on every row that moves it through `useReorderListItem()`.',
    'Translate `labels` (`handle`, `handleTip`, `handleDescription`, `moveUp`, `moveDown`, `moveToTop`, `moveToBottom`, `moved`, `cancelled`), or set them once for the app with a `LabelsProvider`.',
    'In forced-colours mode the dragged row and the drop zone take a `CanvasText` border.',
  ],
};
