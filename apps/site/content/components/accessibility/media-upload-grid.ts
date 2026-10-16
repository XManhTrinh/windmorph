import type { ComponentAccessibility } from './types';

export const mediaUploadGrid: ComponentAccessibility = {
  keyboard: [
    {
      keys: ['Tab'],
      action:
        "Moves focus into the grid, onto the last focused tile. From a tile, Tab moves through that tile's buttons, then out of the grid.",
    },
    {
      keys: ['Arrow Up', 'Arrow Down', 'Arrow Left', 'Arrow Right'],
      action:
        "Move between tiles: Left and Right along the order, Up and Down between rows in the `grid` layout. At the grid's edge they stop, without scrolling the page.",
      where: 'Between tiles',
    },
    {
      keys: ['Enter'],
      action: 'Opens the file picker.',
      where: 'On the add tile',
    },
    {
      keys: ['Enter'],
      action:
        'Picks the photo up to move it (with `onReorder`). The arrow keys then move between the places it can go, Enter drops it there and Escape cancels.',
      where: 'On a photo',
    },
  ],
  keyboardNotes: [
    'In right-to-left layouts Arrow Left and Arrow Right follow the reading direction.',
    'The corner buttons and the action menu keep their own keys, as any {@link IconButton} and {@link Menu} do.',
  ],
  screenReader: {
    role: "A `grid` of rows, one per tile, with the add tile last. Each photo's buttons are inside its row.",
    name: 'The grid is named by your `aria-label` or `aria-labelledby`. Each photo is named by its `alt`, the add tile by `labels.add` ("Add photos"). The buttons are named `labels.remove` ("Remove Lake at dusk"), `labels.actions` ("Options for Lake at dusk") and `labels.retry` ("Retry"), and show that name as the icon button\'s own tooltip on hover and keyboard focus, without reading it twice.',
    states:
      'Each photo is described by its state: "Uploading, 40%" (`labels.uploading`), or "Couldn\'t upload. Too large" (`labels.failed` and the item\'s `error`). The progress indicator is named by the same words. While `disabled`, every button and the add tile are disabled.',
    notes: [
      'Moving a photo is React Aria\'s drag and drop: each step is announced, and the places it can go are read as "Insert between … and …".',
      'The thumbnails are decorative (`alt=""`): the tile carries the name. The error strip on a photo is hidden, since the description already says it, and so is the "Drop photos to add them" overlay.',
      'Every word comes from `labels`.',
    ],
  },
  focus: [
    "The grid is one Tab stop: focus returns to the last focused tile. A focused tile shows M3's focus indicator inside its edge (a 3px `secondary` outline drawn inset), so a scrolling row never clips it.",
    'Removing a photo moves focus to the tile after it (which may be the add tile), or else the one before it, without scrolling the page. Retry keeps focus on the photo.',
  ],
  touchTarget: [
    "Tiles are square: a third to a fifth of the grid's width (2 columns below 280px, 3 below 600px, 4 up to 839px, 5 from 840px), so they stay 88px or more, or 112px in the `row` layout.",
    "The remove, action menu and retry buttons are extra-small icon buttons (32px tall) with an invisible 48 × 48px touch target. They stay at density 0 in a dense theme, and a failed photo's Retry takes the start corner (the action menu steps aside), so no two targets overlap.",
    'A mouse drags a photo to move it; on touch a long press picks it up, so the page still scrolls. The keyboard can do the same, and dropping files from the computer has the add tile as its alternative.',
  ],
  motion: [
    'When the order changes, tiles slide to their new places, and new tiles grow and fade in. Under reduced motion nothing moves, but a new photo still fades in (it only stops growing).',
    'Colours and opacity (a dragged photo, the drop bars, the drop overlay) fade on the effects spring; under reduced motion they change at once. The press ripple on the add tile and on a photo being picked up appears at full size without growing.',
  ],
  consumer: [
    "Name the grid with `aria-label` or `aria-labelledby`, and give every photo an `alt`: it names the tile and its buttons, so it can't be empty.",
    'Pass `labels` from your translations; `uploading`, `remove` and `actions` are functions, so the words can go in any order.',
    'Pass `onReorder` only when the order matters, and set `disabled` while the post is being sent.',
    'Give a failed photo an `error` that says why ("Too large (max 10 MB)") and pass `onRetry` when trying again can help.',
    'In forced-colours mode tiles, the drop bars and the drop outline use system colours; keep `classNames` overrides from removing them.',
    'Give custom icons (`removeIcon`, `retryIcon`, `actionsIcon`, `addIcon`) no name of their own: the buttons are named by `labels`.',
  ],
};
