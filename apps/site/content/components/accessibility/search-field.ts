import type { ComponentAccessibility } from './types';

export const searchField: ComponentAccessibility = {
  keyboard: [
    {
      keys: ['Tab', 'Shift + Tab'],
      action:
        'Moves focus to the input, then the clear button (while there is text) and any trailing icon button.',
    },
    {
      keys: ['Escape'],
      action:
        'Clears the query. With the input already empty, Escape reaches what holds the field, such as a dialog, which can close.',
      where: 'In the input',
    },
    {
      keys: ['Enter'],
      action: 'Calls `onSubmit` with the query. It waits while an input method is composing.',
      where: 'In the input',
    },
    {
      keys: ['Enter', 'Space'],
      action: 'Clears the query and moves focus back to the input.',
      where: 'On the clear button',
    },
  ],
  keyboardNotes: [
    'Typing, a press and Arrow Down open nothing: the field filters in place.',
    'Moving through what it filters is up to that content, such as a {@link List}.',
  ],
  screenReader: {
    role: 'The input is a `searchbox` (`type="search"`). Nothing pops up, so it has no `aria-expanded` or `aria-haspopup`.',
    name: "The field's `aria-label` or `aria-labelledby` names the input, which the types require. The placeholder is not the name. `aria-describedby`, `aria-details` and `aria-controls` go to the input too.",
    states: 'Disabled (`disabled` on the input).',
    notes: [
      'The clear button is named by `labels.clear` ("Clear search").',
      'Say when nothing matches in a `role="status"` region of your own, so screen readers hear it.',
    ],
  },
  focus: [
    'Keyboard focus in the input draws the 3px `secondary` focus ring inside the pill; pointer presses show no ring.',
    "A press on the pill around the input (its padding or the leading icon) puts the caret in the input. A press on the clear button keeps focus, and a phone's keyboard, in the input.",
    'With `autoFocus` the input takes focus as the field mounts.',
  ],
  touchTarget: [
    'The field is 56px tall, and the leading and trailing slots are 48 × 48px.',
    'The clear button and any trailing icon buttons are `standard` {@link IconButton}s with their own 48 × 48px touch targets, 8px apart so they meet without overlapping.',
  ],
  motion: { none: 'The field has no motion of its own; its icon buttons keep their state layers.' },
  consumer: [
    'Name the field with `aria-label` or `aria-labelledby`, matching the placeholder ("Search settings").',
    'Point `aria-controls` at what the field filters, and announce "No results" in a `role="status"` region.',
    'Give every icon-only button in `leadingIcon` and `trailingIcon` an `aria-label`.',
  ],
};
