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
    ],
  },
  focus: [
    'The actions and the close button sit in the Tab order after the message.',
    'With `focusOnMount`, focus moves to the alert itself once, when it first appears (`tabIndex={-1}`), so the next Tab continues from there. The alert draws no focus ring while it holds focus.',
    'Closing it moves no focus: the app decides where focus goes.',
  ],
  touchTarget: [
    'The close button is a small (40px) {@link IconButton} with an invisible 48 × 48px touch target. Actions keep their own {@link Button} targets.',
  ],
  motion: [
    'It fades in on the default effects spring as it appears. Under reduced motion it appears at once.',
  ],
  consumer: [
    "Write the message so it says what happened and what to do; the tone's colour and icon are not read.",
    'Use `focusOnMount` for an error that blocks a form after a failed submit, and nowhere else.',
    'When the alert closes and focus was in it, move focus somewhere sensible, such as the field to fix.',
    'Pass `labels.close` in your language, and `titleAs` a heading level when the alert heads a section.',
    'In forced-colours mode every alert keeps a border; keep `classNames` overrides from removing it.',
  ],
};
