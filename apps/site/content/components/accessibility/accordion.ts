import type { ComponentAccessibility } from './types';

export const accordion: ComponentAccessibility = {
  keyboard: [
    {
      keys: ['Tab'],
      action:
        "Moves focus to each header in turn, and into an open panel's links and controls before the next header.",
    },
    {
      keys: ['Enter', 'Space'],
      action: "Opens or folds the focused header's panel.",
    },
    {
      keys: ['Arrow Down', 'Arrow Up'],
      action: 'Moves focus to the next or previous header, wrapping at the ends.',
    },
    {
      keys: ['Home', 'End'],
      action: 'Moves focus to the first or last header.',
    },
  ],
  keyboardNotes: [
    'Disabled headers are disabled buttons, so Tab and the arrow keys skip them.',
    'Moving focus with the arrow keys scrolls the page no further than it takes to show the header.',
  ],
  screenReader: {
    role: 'The WAI-ARIA accordion pattern: each header is a heading (`h3` by default, set with `headingLevel`) holding a `button`. With six items or fewer, each panel is a `region`.',
    name: "The button is named by the header's title (its supporting text is read with it); a panel's region is named by its header.",
    states:
      'The button announces expanded or collapsed (`aria-expanded`) and points at its panel (`aria-controls`); a disabled header is announced as dimmed.',
    notes: [
      'Closed panels stay in the page as `hidden="until-found"`: screen readers and Tab skip them, while find-in-page and `#fragment` links can still reach their text and open them.',
      'Past six items the panels are plain groups rather than regions, so the page has no flood of landmarks.',
      'The chevron is decorative (`aria-hidden`).',
    ],
  },
  focus: [
    'Each header shows the M3 focus indicator when focused from the keyboard; a segmented item also takes its rounder focused corners.',
    "If focus is inside a panel as it folds (another header opened it, say), focus moves to that panel's header before the panel turns `inert`, so it never drops to the page.",
    'Opening a panel moves no focus: the person reaches its content with Tab.',
  ],
  touchTarget: [
    'Each header is a full-width row at least 56px tall with one line and 72px with supporting text, the core list item heights.',
    "With `density` (or the theme's), headers lose 4px a step (one line 44px at -3). They are stacked full-width rows, so the targets never overlap and stay above WCAG 2.5.8's 24px minimum; leave density to the reader's choice.",
  ],
  motion: [
    'Under reduced motion panels only fade in and out instead of also opening their height, the chevron flips without turning, and segmented corners snap to their new shape.',
    'In forced-colours mode segmented items keep a border, so each container stays visible.',
  ],
  consumer: [
    'Pick a `headingLevel` that fits the page outline: one below the heading the accordion sits under.',
    'Keep titles short and descriptive: they name the buttons and the panels.',
    'Give every item a unique `id`; it is how `expandedKeys` and `defaultExpandedKeys` refer to it.',
    "Use the accordion for content the person may skip. Content everyone needs, such as a form's required fields, belongs on the page itself.",
  ],
};
