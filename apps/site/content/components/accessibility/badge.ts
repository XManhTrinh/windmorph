import type { ComponentAccessibility } from './types';

export const badge: ComponentAccessibility = {
  keyboard: {
    none: "A badge has no keyboard interaction of its own; it rides on whatever it is placed on, and that element's keys apply.",
  },
  screenReader: {
    role: 'No role of its own: a `span` read as part of the text around it.',
    name: 'Not named on its own; its text joins the name of the element it sits in ("Inbox 5").',
    states:
      'A large badge reads its count or label; a small dot reads "New notification" (`labels.newNotification`). `label` replaces either ("3 unread messages"), and the visible text is then hidden (`aria-hidden`).',
    notes: [
      'On a {@link NavigationBar} or {@link NavigationRail} item, pass the badge through the item\'s `badge` prop, not a `BadgedBox` in its icon: the item reads it after its name, as M3 asks. A count reads itself (or `badgeLabel`, "3 unread messages"), and a dot reads "New notification".',
      'Counts are formatted for the locale and capped at `max` (999 by default, so "999+"); a count stays left to right in right-to-left layouts, so it never reads as "+999".',
    ],
  },
  focus: { none: 'A badge is never focusable; focus goes to the element it is placed on.' },
  touchTarget: {
    none: 'A badge takes no presses; the touch target is that of the element it is placed on.',
  },
  motion: {
    none: 'A badge has no motion of its own; it appears and disappears without animating.',
  },
  consumer: [
    'An anchor with its own `aria-label` (an {@link IconButton}, say) hides the badge\'s text, so put the badge\'s meaning in that label: "Messages, 12 unread".',
    'Pass `label` when the count alone is unclear ("3 unread messages"), and `labels.newNotification` to translate the dot\'s announcement.',
    'Keep the default `error` colours, or keep any custom colours at a 3:1 contrast or more against what surrounds the badge.',
    "Remove an unread badge once its destination is opened; the badge doesn't hide itself.",
    'A bare SVG anchor in `BadgedBox` gets the 24px icon size; wrap it in a sized element for other sizes.',
  ],
};
