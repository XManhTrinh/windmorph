import type { ComponentAccessibility } from './types';

export const shelf: ComponentAccessibility = {
  keyboard: [
    {
      keys: ['Tab', 'Shift + Tab'],
      action:
        'Moves to the next or previous card, which comes wholly into view; after the last card, to Previous and Next.',
    },
    { keys: ['Enter'], action: "Follows the focused card's own link." },
    {
      keys: ['Enter', 'Space'],
      action: 'On Previous or Next: moves the row most of its width; focus stays on the button.',
    },
  ],
  keyboardNotes: [
    'When no card takes focus, the row itself is focusable, so the arrow keys scroll it (WCAG 2.1.1).',
    'There are no arrow keys between cards: Tab moves along the row, and each card keeps its own keys.',
  ],
  screenReader: {
    role: 'A `list` (a `ul` with `role="list"`, which Safari would otherwise drop), each card a `listitem`. Not a carousel: no `aria-roledescription`. Previous and Next are buttons.',
    name: 'The list takes `aria-label` or `aria-labelledby` (one is required), usually its heading. Previous and Next are named for what they move, from the shelf\'s name: "Previous: Series", "Next: Series".',
    states:
      "The arrow at an end is `aria-disabled`, kept in place rather than removed or `disabled`, so focus on it isn't lost; a press on it does nothing.",
    notes: [
      'The list reports how many cards it holds, as any list does.',
      "The arrows are drawn only for a mouse, so screen-reader users on touch move with the screen reader's own gestures and Tab.",
    ],
  },
  focus: [
    "Tab follows the cards in order, then Previous and Next. A focused card comes wholly into view, its start on the row's snap line, so its focus ring isn't cut at the edge (WCAG 2.4.11).",
    "The row keeps 4px of room above and below (`--wm-shelf-ring-room`), so a card's ring at a 2px offset is drawn whole.",
    'The arrows show the shared two-tone ring over pictures, on keyboard focus only, and show themselves while focus is in the shelf.',
  ],
  touchTarget: [
    'Previous and Next are 48px. On touch the row scrolls with a swipe and has no arrows; give the shelf a "See all" link for a route without one (WCAG 2.5.7).',
  ],
  motion: [
    "Previous and Next scroll with the browser's smooth scroll; under reduced motion the row jumps.",
    "The arrows fade in and out on the default effects spring, kept under reduced motion (a fade isn't movement).",
  ],
  consumer: [
    'Name each shelf: `aria-labelledby` its visible heading, or `aria-label`.',
    "Make each card one link (or one control) with a visible focus ring that fits inside the card's box.",
    'Add a "See all" link near the heading on touch layouts, so the whole set is reachable without swiping.',
    "Translate `labels.previous` and `labels.next` (each given the shelf's name), or set them once for the app with a `LabelsProvider`.",
    'In forced-colours mode the arrows keep a `CanvasText` boundary; the cards are yours to keep distinct.',
  ],
};
