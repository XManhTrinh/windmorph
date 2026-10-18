import type { ComponentAccessibility } from './types';

export const tooltip: ComponentAccessibility = {
  keyboard: [
    {
      keys: ['Tab'],
      action: 'Focusing the trigger shows its tooltip; moving focus away hides it at once.',
      where: 'Plain and transient rich tooltips',
    },
    {
      keys: ['Escape'],
      action: 'Hides the tooltip.',
      where: 'Plain and transient rich tooltips',
    },
    {
      keys: ['Enter', 'Space'],
      action: 'Opens or closes the rich tooltip. Focus stays on the trigger.',
      where: 'On a persistent trigger',
    },
    {
      keys: ['Tab'],
      action:
        'From the trigger, moves into the open tooltip, to its first link or button. From its last control, moves on to whatever follows the trigger on the page, which closes it.',
      where: 'Persistent rich tooltip',
    },
    {
      keys: ['Shift + Tab'],
      action:
        "Moves back through the tooltip's controls to its trigger. From whatever follows the trigger, moves into the tooltip, at its last control.",
      where: 'Persistent rich tooltip',
    },
    {
      keys: ['Escape'],
      action:
        'Closes the tooltip, from its trigger or from inside it, and puts focus back on the trigger.',
      where: 'Persistent rich tooltip',
    },
  ],
  keyboardNotes: [
    "A persistent rich tooltip is portalled to the end of the document, but its controls come straight after its trigger in the Tab order, as M3's focus order asks.",
  ],
  screenReader: {
    role: "`tooltip` for a plain tooltip and a transient rich tooltip. A persistent rich tooltip is a non-modal `dialog` (no `aria-modal`), so screen readers don't announce a modal.",
    name: "A plain or transient tooltip describes its trigger (`aria-describedby`), so it is read after the trigger's own name. A persistent rich tooltip is named by its `title`, or by `aria-label` when it has none.",
    states:
      'A persistent trigger announces that it opens a dialog (`aria-haspopup="dialog"`), whether it is open (`aria-expanded`), and points at the open tooltip (`aria-controls`).',
    notes: [
      'The caret is decorative and hidden from assistive tech (`aria-hidden`).',
      'Tooltips sit above every other layer: a modal open underneath (a dialog or sheet) neither hides them from assistive tech nor pulls focus out of them.',
    ],
  },
  focus: [
    'A plain or transient tooltip never takes focus; it shows while its trigger is hovered or keyboard-focused, or after a touch long press.',
    'A tooltip shown by focus does not hide on a timer: it stays until focus leaves, the pointer leaves, or Escape, as WCAG 1.4.13 asks. It also stays while the pointer is over it, and for 1.5 seconds (`closeDelay`) after the pointer leaves or a touch lifts.',
    'A transient rich tooltip stays open while focus is inside it, and closes when focus leaves.',
    'Opening a persistent rich tooltip leaves focus on the trigger, and the tooltip never traps focus. It closes when the trigger is pressed again, on Escape, or on a press anywhere outside it; it stays when the pointer leaves.',
  ],
  touchTarget: {
    none: "A tooltip isn't a target itself: on touch it opens from a long press on its trigger. Put actions in a rich tooltip as buttons, which bring their own touch targets.",
  },
  motion: [
    'Under reduced motion the tooltip only fades in and out: it is not revealed from the side of its anchor.',
  ],
  consumer: [
    "Don't use a tooltip as the only name of a control: give an icon-only button its own `aria-label`; the tooltip adds a description.",
    'Keep plain tooltips short and free of links or buttons. When a tooltip holds actions keyboard users must reach, use a `RichTooltipTrigger` with `persistent`.',
    'Give a persistent rich tooltip a `title`, or an `aria-label` when it has no subhead.',
    "Don't put information only in a tooltip that people need to complete a task, since touch users have to long-press to see it.",
  ],
};
