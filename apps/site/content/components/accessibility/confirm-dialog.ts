import type { ComponentAccessibility } from './types';

export const confirmDialog: ComponentAccessibility = {
  keyboard: [
    {
      keys: ['Tab', 'Shift + Tab'],
      action: 'Move between the content and the two actions, inside the dialog.',
    },
    { keys: ['Enter', 'Space'], action: 'Press the focused action.' },
    { keys: ['Escape'], action: 'Backs out, as Cancel does. Does nothing while the action runs.' },
  ],
  keyboardNotes: [
    'Focus starts on Cancel, so Enter right after it opens backs out rather than acts.',
  ],
  screenReader: {
    role: 'An `alertdialog`, modal: the rest of the page is hidden from assistive tech while it is open.',
    name: 'Named by `title` and described by `description`. The acting button is named by `confirmLabel`; the other by `labels.cancel` ("Cancel").',
    states:
      'While the action runs the acting button says so in its name ("Remove, Loading", from `labels.pending` or the core Button\'s word) and stays focusable; Cancel is disabled.',
    notes: [
      'A failure (`error`) is an `alert`, announced once as it appears, and again if a retry fails the same way.',
      'The `icon` above the title and the scrim are decorative and hidden from assistive tech (`aria-hidden`).',
      "With `destructive` the label still names the action, so the colour isn't the only sign.",
    ],
  },
  focus: [
    'It opens with focus on Cancel, the least destructive choice, as the ARIA alert dialog pattern asks. `initialFocus` moves it to the acting button, or to the first control in the content for a field that must be filled first.',
    'Focus stays inside the dialog. While the action runs it stays on the acting button, which is pending, not disabled.',
    'After a failure, focus moves to the acting button, so Enter tries again.',
    "Closing returns focus to what opened it. When the action removed that element (a deleted row's button), move focus yourself in `onClosed`.",
  ],
  touchTarget: ['Both actions are {@link Button}s, each with its own 48px touch target.'],
  motion: [
    'It moves as the core {@link Dialog} does, and only fades under reduced motion. `instant` turns every motion off.',
    "The failure's alert fades in, under reduced motion too: a fade is not movement.",
  ],
  consumer: [
    'Write `title` as the question, naming the thing ("Remove Alex from the team?"), and `confirmLabel` as what happens ("Remove"), never "OK" or "Yes".',
    'Say what will happen in `description`, and whether it can be undone.',
    'Give the failure\'s words through `error`, saying what to do next ("That didn\'t work. Try again.").',
    'Translate `labels.cancel` and `labels.pending`, or set them once for the app with a {@link LabelsProvider}.',
  ],
};
