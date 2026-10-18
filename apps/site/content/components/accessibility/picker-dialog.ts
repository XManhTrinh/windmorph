import type { ComponentAccessibility } from './types';

export const pickerDialog: ComponentAccessibility = {
  keyboard: [
    {
      keys: ['Tab', 'Shift + Tab'],
      action: 'Moves through the picker and the actions, staying inside the dialog.',
    },
    { keys: ['Escape'], action: 'Closes the dialog without calling `onConfirm`.' },
    {
      keys: ['Enter'],
      action:
        "With `onConfirm`, Enter on a day (or in a typed date) selects it, then closes the dialog and saves. `onConfirm` runs once the picker's new value has rendered. A range saves once both ends are picked.",
      where: 'In a date picker',
    },
  ],
  keyboardNotes: [
    'The picker inside keeps its own keys: see {@link DatePicker} and {@link TimePicker}.',
  ],
  screenReader: {
    role: '`dialog`, modal (React Aria `useModalOverlay` and `useDialog`): the rest of the page is hidden from assistive tech while it is open.',
    name: 'The required `aria-label` or `aria-labelledby`: the types reject a dialog with neither. In the time variant a `title` also names it.',
    states: 'None of its own; the picker inside announces its value.',
    notes: [
      'The scrim is decorative (`aria-hidden`).',
      'The actions read in order: `modeToggleButton` at the start, then `dismissButton` and `confirmButton` at the end. Full screen, a close (x) button named `labels.close` ("Close") comes first and the Save button (`labels.save`) last.',
    ],
  },
  focus: [
    'Opening it moves focus into the dialog; the docked or modal picker inside then focuses its selected day where it does so. Focus is contained while it is open and returned to what opened it when it closes.',
    'While it animates out, focus is no longer contained.',
  ],
  touchTarget: [
    'The actions are your buttons; text and icon buttons have 48 × 48px targets. The full-screen close (x) button is an icon button with a 48 × 48px target.',
    'A press outside the panel closes the dialog while `closedBy` is `"any"` (the default), so the scrim is one large target.',
  ],
  motion: [
    "Under reduced motion both transitions (`reveal` and `scale`) keep only their fades: the dialog doesn't slide, grow or scale.",
  ],
  consumer: [
    'Name the dialog for what it picks (`aria-label="Select date"`), or point `aria-labelledby` at a visible title.',
    'Pass a dismiss button as well as the confirm button, so leaving without saving is one obvious action and not only Escape or a press outside.',
    'Use text buttons for the actions, as M3 does, and translate `labels` for the full-screen close and Save buttons.',
  ],
};
