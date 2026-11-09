import type { ComponentAccessibility } from './types';

export const navigationRailGroup: ComponentAccessibility = {
  keyboard: [
    { keys: ['Tab'], action: 'Moves through the destinations, and into an open column’s links.' },
    {
      keys: ['Arrow Up', 'Arrow Down'],
      action: 'Move between the rail’s destinations.',
      where: 'In the rail',
    },
    { keys: ['Enter'], action: 'Follows the focused link.' },
    { keys: ['Escape'], action: 'Closes a preview and returns focus to its destination.' },
  ],
  keyboardNotes: [
    'Keyboard focus opens a column at once; a column someone is reading by keyboard stays open when the pointer leaves.',
  ],
  screenReader: {
    role: 'Destinations are links in the rail’s `nav`; the column is a `group`. In an expanded rail, a group is an accordion.',
    name: 'The destination’s `label`; the column takes `aria-label`, or the label.',
    states:
      'A destination has `aria-expanded` and `aria-controls`. The current link has `aria-current="page"`, and a closed column is `inert`.',
    notes: [
      'A group that holds the current page shows as current without claiming to be the page.',
    ],
  },
  focus: [
    'Closing a preview with focus inside it hands focus to its destination first.',
    'Each link shows the M3 focus indicator from the keyboard.',
  ],
  touchTarget: [
    'Destinations are the rail’s, and links are 48px rows at density 0.',
    'Touch only navigates: there’s no preview to dismiss.',
  ],
  motion: [
    'The column’s width springs open and closes without a bounce. Under reduced motion it only fades.',
    'In forced colours the column keeps a `CanvasText` edge and the current link keeps `Highlight`.',
  ],
  consumer: [
    'Pass `currentPath`, or `current` on an item, so the right link is marked.',
    'With `pinned`, leave room for the column in your layout.',
    'Wrap your app in React Aria’s `RouterProvider` for client-side navigation.',
  ],
};
