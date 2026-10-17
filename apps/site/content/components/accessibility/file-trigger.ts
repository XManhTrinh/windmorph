import type { ComponentAccessibility } from './types';

export const fileTrigger: ComponentAccessibility = {
  keyboard: [
    { keys: ['Tab'], action: 'Moves focus to the button inside it, and on to the next element.' },
    {
      keys: ['Enter', 'Space'],
      action:
        "Presses the button, which opens the system file picker (or the phone's camera with `capture`).",
    },
  ],
  keyboardNotes: [
    "The file picker is the browser's own dialog, so its keys are the operating system's.",
  ],
  screenReader: {
    role: 'Whatever the button inside it is: usually a `button`.',
    name: "The button's own name: its label, or the `aria-label` of an {@link IconButton}.",
    states: "The button's own states, such as disabled.",
    notes: [
      'The file input is hidden from everyone (`hidden`, `aria-hidden` and `tabIndex={-1}`), so the control is announced once, as the button.',
    ],
  },
  focus: [
    'Focus stays on the button, which shows its own focus indicator. The hidden input is never focused.',
  ],
  touchTarget: [
    'The button is the target, at its own size: see the button you put inside it ({@link Button}, {@link IconButton}, {@link Fab}).',
  ],
  motion: { none: 'It adds no motion: the button inside it keeps its own.' },
  consumer: [
    'Put exactly one library button inside it (or anything reading `TriggerContext`), with a name that says what it picks: "Change photo", not "Browse".',
    'Put it inside a `TooltipTrigger`, not around one: the tooltip keeps working. To stop it, disable the button.',
    "For a trigger it can't wrap, such as a menu item, use `useFileTrigger`: call `open()` from the item's action and render `input` once.",
  ],
};
