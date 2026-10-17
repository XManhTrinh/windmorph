import type { ComponentAccessibility } from './types';

export const dialog: ComponentAccessibility = {
  keyboard: [
    {
      keys: ['Tab', 'Shift + Tab'],
      action:
        "Moves focus between the dialog's controls. Focus is contained: it wraps within the dialog and never reaches the page behind.",
    },
    {
      keys: ['Escape'],
      action: 'Closes the dialog, unless `closedBy="none"`.',
    },
    {
      keys: ['Arrow Up', 'Arrow Down', 'Page Up', 'Page Down'],
      action:
        'Scroll `DialogContent` when it is taller than the dialog and has focus. Tab reaches it after the controls before it.',
      where: 'In scrolling content',
    },
  ],
  screenReader: {
    role: '`alertdialog` for a basic dialog (the default), or `dialog` when `fullScreen` is not `"never"`. `role` overrides either.',
    name: '`DialogTitle` or `DialogHeader`, through `aria-labelledby`, or `aria-label` when there is no visible title.',
    states:
      'Modal: the page behind is hidden from assistive tech while the dialog is open. An alert dialog is described by its `DialogContent` (`aria-describedby`), and the reference is left out when there is none.',
    notes: [
      'The `icon` above the title and the scrim are decorative and hidden from assistive tech (`aria-hidden`).',
      'Inside a `DialogTrigger`, the trigger announces that it opens a dialog (`aria-haspopup="dialog"`) and whether it is open (`aria-expanded`), and points at the open dialog (`aria-controls`).',
      'In full screen with a header action, `DialogActions` are hidden (`display: none`), so they leave the accessibility tree and each action is announced once. On wider windows a `fullScreen="compact"` dialog hides the header\'s close button the same way.',
    ],
  },
  focus: [
    "On open, focus moves to the dialog's first interactive element, or to an element marked `autoFocus`. With no controls, the dialog itself takes focus.",
    'While `DialogContent` scrolls it is focusable, with a focus ring, so the keyboard can scroll it; initial focus still skips it and goes to the first control.',
    'On close, focus returns to the element that opened it, such as the `DialogTrigger` button.',
    'When the actions stack (M3: "Confirming actions appear above dismissive actions"), they are rendered in that order, so Tab and screen readers go top to bottom: the confirming action first. On one line they keep their source order, the dismissive action first. When the actions are the first controls, initial focus goes to the dismissive action, the least destructive choice (the WAI-ARIA alert dialog pattern): the first one on one line, the bottom one when stacked.',
  ],
  touchTarget: {
    none: 'The dialog has no target of its own. Its actions are {@link Button}s and the full-screen close button is a 48 × 48px {@link IconButton}, each with its own touch target.',
  },
  motion: [
    'Under reduced motion the dialog only fades: the slide, the container\'s growth, the scale of `transition="scale"` and the full-screen container transform from its `origin` are dropped. `instant` turns every motion off, including the fades.',
  ],
  consumer: [
    'Name every dialog with a `DialogTitle` (or `DialogHeader`), or with `aria-label` when there is no visible title.',
    'Put the supporting text in `DialogContent`, so an alert dialog is described by it.',
    'Give `DialogHeader` a `closeLabel`; it names the full-screen close button.',
    'Keep the default alert dialog for decisions that must be made, and pass `role="dialog"` or `closedBy="any"` when pressing outside may close it.',
    'Use at most two actions, with the confirming action last. In development `DialogActions` warns once when it holds more.',
  ],
};
