import type { ComponentAccessibility } from './types';

export const snackbar: ComponentAccessibility = {
  keyboard: [
    {
      keys: ['F6'],
      action:
        'Moves focus to the shown snackbar when it has an action or a dismiss button, as the spec asks for on the web. Change it with `focusShortcut`, or turn it off with `false`.',
    },
    {
      keys: ['Tab', 'Shift + Tab'],
      action: 'Moves between the action and dismiss buttons, and out of the snackbar.',
    },
    { keys: ['Enter', 'Space'], action: 'Activates the focused action or dismiss button.' },
    {
      keys: ['Escape'],
      action:
        'Dismisses the snackbar while focus is inside it, with or without a dismiss (×) button (`onEscape`, or `onDismiss`).',
    },
  ],
  screenReader: {
    role: '`SnackbarHost` is a polite live region (`aria-live="polite"`); each snackbar is a plain container holding its message, a text `button` and an icon `button`.',
    name: 'The message is read as text. The dismiss button is named by `labels.dismiss` ("Dismiss"); on a host, its `labels` reach every snackbar it shows.',
    states: 'None. The shown snackbar carries its focus shortcut in `aria-keyshortcuts`.',
    notes: [
      "Each new message is announced politely, without moving focus. The host's region goes on the page empty and snackbars follow a moment later, so one shown at launch is announced too.",
      'A `Snackbar` rendered without a host announces its message politely itself, when it appears and when the message changes.',
      'A snackbar that is leaving, or waiting behind another, is `inert`.',
    ],
  },
  focus: [
    "A snackbar never takes focus by itself and doesn't trap it: Tab moves in and out freely.",
    'When a snackbar leaves with focus inside it, focus returns to where it was before it entered the snackbar. If that element has gone (an undone row was removed, say), focus moves to the control that followed it in the Tab order, or else the one before it, rather than falling to the page.',
    'The action and dismiss buttons show their own focus rings on keyboard focus.',
    "The auto-dismiss timer (4s `short`, 10s `long`) pauses while the pointer or focus is on the snackbar, so someone reading it or reaching for it doesn't lose the message (WCAG 2.2.1). Snackbars with an action never time out.",
  ],
  touchTarget: [
    'The snackbar is at least 48px tall. Its action is a small text {@link Button} and its dismiss button an {@link IconButton}, which both keep their 48 × 48px touch target. The dismiss button stays at density 0 in a dense theme, as the snackbar keeps its height.',
  ],
  motion: [
    'Under reduced motion a snackbar only fades in and out, without expanding upward from the bottom edge.',
  ],
  consumer: [
    'On the web, use an auto-dismissing snackbar (no action) only alongside inline feedback for the same event, such as a Save button that changes to Saved: the snackbar may be gone before someone reads it. Or give it an action, and it stays until acted on or dismissed.',
    'Document the focus shortcut (F6) where your app lists its shortcuts.',
    "Don't put a `Snackbar` in a live region of your own; the host, or the snackbar itself, already announces it.",
    "Translate the dismiss button's name with `labels.dismiss`.",
  ],
};
