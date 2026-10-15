import type { ComponentAccessibility } from './types';

export const mediaGrid: ComponentAccessibility = {
  keyboard: [
    {
      keys: ['Tab'],
      action: 'Moves focus to the list, then to each tile in turn. Every tile is its own Tab stop.',
    },
    {
      keys: ['Arrow Left', 'Arrow Right'],
      action: 'Scrolls the compact row sideways while the list has focus.',
      where: 'On the list',
    },
    {
      keys: ['Enter', 'Space'],
      action:
        'Presses the tile: `onItemPress` gets its index, usually to open {@link MediaViewer} there.',
      where: 'On a tile',
    },
  ],
  screenReader: {
    role: 'A `list` (`ul`) of list items, each holding a `button`.',
    name: 'The list is named by its required `aria-label` ("Photos"); each tile by its photo\'s `alt`.',
    states: 'None. Screen readers read the number of items from the list.',
    notes: ['Only the first `max` photos are rendered, so the count is of the tiles shown.'],
  },
  focus: [
    'The list itself is focusable (`tabIndex={0}`), so a keyboard can scroll the compact row (WCAG 2.1.1). It is a Tab stop on every window size, also where the grid does not scroll.',
    "Each tile shows M3's focus indicator inside its edge on keyboard focus (a 3px `secondary` outline drawn inset), so the row never clips it. Pointer presses show no ring.",
  ],
  touchTarget: [
    "In the compact row each tile is 112 × 112px (`tile-width`). From medium windows up a tile is a square of the grid's width divided by `columns` (3 by default), less the 4px gaps.",
  ],
  motion: [
    'Only the press ripple moves: under reduced motion it appears at full size without growing.',
  ],
  consumer: [
    "Name the list with `aria-label`, and give every photo an `alt` that says what it shows: it is the tile's only name.",
    'Open something useful from `onItemPress`, such as {@link MediaViewer} on that photo, so pressing a tile always does something.',
    'When `max` hides photos, offer a way to reach the rest, such as a "See all photos" link.',
  ],
};
