import type { ComponentAccessibility } from './types';

export const alert: ComponentAccessibility = {
  keyboard: [
    {
      keys: ['Tab'],
      action:
        'Moves through the actions and the close button, in order. The alert itself is not a Tab stop.',
    },
    { keys: ['Enter', 'Space'], action: 'Presses the focused action, or the close button.' },
  ],
  keyboardNotes: ['Escape does not close it: an alert stays until it is resolved or closed.'],
  screenReader: {
    role: '`alert` for the `error` tone, read at once; `status` for the other tones, read politely.',
    name: 'None of its own: its title and message are read as its content.',
    states: 'None.',
    notes: [
      'The tone icon is decorative and hidden from assistive tech, so the words must say what kind of message it is.',
      'The close button is an {@link IconButton} named by `labels.close` ("Close").',
      "The live region goes into the page a moment (100ms) before its content, so screen readers announce an alert that mounts with its message. One in the server's HTML shows at once.",
    ],
  },
  focus: [
    'The actions and the close button sit in the Tab order after the message.',
    'With `focusOnMount`, focus moves to the alert itself once, when it first appears (`tabIndex={-1}`), and it scrolls into view no further than needed, so the next Tab continues from there. From the keyboard it shows the M3 focus indicator while it holds focus.',
    'Closing it never drops focus to the page: before `onClose` runs, focus goes back to where it was before `focusOnMount`, or on to the next control.',
  ],
  touchTarget: [
    'The close button is a small (40px) {@link IconButton} with an invisible 48 × 48px touch target, kept at density 0 so it never shrinks. Actions keep their own {@link Button} targets.',
  ],
  motion: [
    'It fades in on the default effects spring as it appears, under reduced motion too: a fade is not movement.',
    'Leaving (`open={false}`), it fades out on the fast effects spring as its height folds; under reduced motion only the fade runs, and its height stays until it has gone.',
  ],
  consumer: [
    "Write the message so it says what happened and what to do; the tone's colour and icon are not read.",
    'Use `focusOnMount` for an error that blocks a form after a failed submit, and nowhere else.',
    'Hide it with `open={false}` rather than unmounting it, so it leaves with its motion and hands focus on first; if focus should go somewhere specific (the field to fix), move it in `onClose`.',
    'Pass `labels.close` in your language, and `titleAs` a heading level when the alert heads a section.',
    'In forced-colours mode every alert keeps a border; keep `classNames` overrides from removing it.',
  ],
};
