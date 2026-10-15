import type { ComponentAccessibility } from './types';

export const navigationRail: ComponentAccessibility = {
  keyboard: [
    {
      keys: ['Tab'],
      action: 'Moves focus through the header (a menu button, a FAB), then each item in turn.',
    },
    {
      keys: ['Arrow Up', 'Arrow Down'],
      action: 'Moves focus to the previous or next item, wrapping, without choosing it.',
    },
    { keys: ['Home', 'End'], action: 'Moves focus to the first or last item.' },
    {
      keys: ['Enter'],
      action: 'Opens the focused destination. On a button item Space does the same.',
    },
    {
      keys: ['Escape'],
      action: 'Collapses the expanded rail.',
      where: 'Modal rail',
    },
  ],
  keyboardNotes: [
    'The arrow keys skip disabled items.',
    'Pressing the current destination again calls `onReselect`, where the page can scroll back to the top.',
  ],
  screenReader: {
    role: 'A `navigation` landmark (`nav`); each item is a `link` (`href`) or a `button`. The expanded modal rail is a `dialog` holding the header and a `nav`.',
    name: 'The rail, and the modal dialog, are named by `aria-label` or `aria-labelledby`, which the types require. Each item is named by its label.',
    states:
      'The current destination has `aria-current="page"`. A disabled item is announced as disabled.',
    notes: [
      'Icons, the active indicator and the state layer are hidden from assistive tech (`aria-hidden`).',
      'A `badge` describes its item (`aria-describedby`), read after the name: its text, its `label`, or `badgeLabel` ("3 new messages"). A small (dot) badge reads "New notification".',
      'While the modal rail is open, the rest of the page is hidden from assistive tech.',
    ],
  },
  focus: [
    "The header and the items are in the Tab order in their visual order. A disabled item can't be focused.",
    "Keyboard focus shows M3's focus indicator, a 3px `secondary` outline 2px outside the pill. Pointer presses show no ring.",
    'The modal rail moves focus to its first interactive element when it opens (the menu button, the FAB or the first destination) and keeps focus inside. Escape, a press outside, or choosing an item collapses it and returns focus to where it was.',
  ],
  touchTarget: [
    "A collapsed item is the rail's full 96px width and at least 64px tall.",
    'An expanded item is the whole row, at least 56px tall, larger than the pill that shows the state.',
  ],
  motion: [
    "Under reduced motion the rail expands and collapses at once, and the active indicator fades in whole instead of expanding from the icon's centre. The press ripple appears at full size without growing.",
    'A `modal` rail fades in and out at its full width instead of growing or sliding from the edge.',
    'With `indicatorMotion="slide"`, the pill fades in place under reduced motion instead of sliding.',
  ],
  consumer: [
    'Name the rail with `aria-label` or `aria-labelledby`, distinct from other navigation on the page.',
    'Give every item a short visible label. Labels wrap rather than truncate, so keep the full text.',
    'Give a menu button in `header` an `aria-label` that says what it does ("Expand navigation" / "Collapse navigation").',
    'Mark the current destination with `selected`, and give it a filled `selectedIcon` where the icon set has one, so the state does not rest on colour alone.',
    'Scroll the page to the top in `onReselect`, as M3 asks.',
  ],
};
