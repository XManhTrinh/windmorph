import type { ComponentAccessibility } from './types';

export const navigationBar: ComponentAccessibility = {
  keyboard: [
    { keys: ['Tab'], action: 'Moves focus to each item in turn, and on past the bar.' },
    {
      keys: ['Arrow Left', 'Arrow Right'],
      action: 'Moves focus to the previous or next item, wrapping, without choosing it.',
    },
    { keys: ['Home', 'End'], action: 'Moves focus to the first or last item.' },
    {
      keys: ['Enter'],
      action: 'Opens the focused destination. On a button item Space does the same.',
    },
  ],
  keyboardNotes: [
    'The arrow keys skip disabled items and are mirrored right to left.',
    'Pressing the current destination again calls `onReselect`, where the page can scroll back to the top.',
  ],
  screenReader: {
    role: 'A `navigation` landmark (`nav`); each item is a `link` (`href`) or a `button`.',
    name: 'The bar is named by `aria-label` or `aria-labelledby`, which the types require. Each item is named by its label.',
    states:
      'The current destination has `aria-current="page"`. A disabled item is announced as disabled.',
    notes: [
      'Icons, the active indicator and the state layer are hidden from assistive tech (`aria-hidden`).',
      'A `badge` describes its item (`aria-describedby`), read after the name: its text, its `label`, or `badgeLabel` ("3 new messages"). A small (dot) badge reads "New notification".',
    ],
  },
  focus: [
    "The items are in the Tab order in their visual order. A disabled item can't be focused.",
    "Keyboard focus shows M3's focus indicator, a 3px `secondary` outline 2px outside the pill. Pointer presses show no ring.",
    "A bar hidden by `hide-on-scroll` stays in the Tab order, and focusing one of its items doesn't bring it back.",
  ],
  touchTarget: [
    "Every item stretches to the bar's height, 64px or more when a label wraps, so the whole item is the touch target, not only the pill.",
    "Stacked items share the bar's width (or are at least the 56px pill wide when centred); items with the icon beside the label are at least 56px wide.",
  ],
  motion: [
    "Under reduced motion the active indicator fades in whole instead of expanding from the icon's centre, and the press ripple appears at full size without growing. Colours still fade.",
    'With `scrollBehavior="hide-on-scroll"`, the bar stays put under reduced motion.',
  ],
  consumer: [
    'Name the bar with `aria-label` or `aria-labelledby`, distinct from other navigation on the page.',
    'Give every item a short visible label. Labels wrap rather than truncate, so keep the full text.',
    'Mark the current destination with `selected`, and give it a filled `selectedIcon` where the icon set has one, so the state does not rest on colour alone.',
    "Leave `hide-on-scroll` off where a screen reader is in use, as M3 asks; the bar can't detect one.",
    'Scroll the page to the top in `onReselect`, as M3 asks.',
  ],
};
