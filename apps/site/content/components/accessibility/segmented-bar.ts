import type { ComponentAccessibility } from './types';

export const segmentedBar: ComponentAccessibility = {
  keyboard: [
    {
      keys: ['Arrow Right', 'Arrow Up'],
      action: 'Reads the next part.',
      where: '`SegmentedBar`',
    },
    {
      keys: ['Arrow Left', 'Arrow Down'],
      action: 'Reads the part before.',
      where: '`SegmentedBar`',
    },
    { keys: ['Home', 'End'], action: 'Reads the first or the last part.', where: '`SegmentedBar`' },
    {
      keys: ['Page Up', 'Page Down'],
      action: 'Moves a tenth of the parts, at least one: with six parts or fewer, one part.',
      where: '`SegmentedBar`',
    },
    {
      keys: ['Escape'],
      action:
        'Hides the readout, wherever focus is for one the pointer shows. It shows again on another part (a key or the pointer), once the pointer leaves and comes back, or when the bar takes focus again. With no readout showing, Escape goes on, so a dialog round the bar still closes.',
      where: '`SegmentedBar`',
    },
  ],
  keyboardNotes: [
    'Right to left, Arrow Left reads the next part and Arrow Right the one before, as the parts run from the right.',
    'Tabbing to the bar reads its first part and shows the readout, and the keys start there; after a press or a tap they go on from the part pressed.',
    '`SegmentedList` has no keys: its rows are text, with nothing to focus.',
  ],
  screenReader: {
    role: '`SegmentedBar`: a `slider` (a native range input, unseen, over the parts), then the key, a list named `labels.parts` ("Parts") and the bar’s name. `SegmentedList`: a list, one item per part.',
    name: 'Named by `aria-label` or `aria-labelledby`, or in a `ChartFrame` by its title; a development build warns about one with no name.',
    states:
      'The slider’s value text (`aria-valuetext`) is the part it reads, then where it is among the parts: "Phone: 5,120, 59%, 1 of 3", from `labels.describePart`. With no parts it says `labels.noValue` ("No value") and is `aria-disabled`, still focusable, so focus on it never drops to the page. Each list row reads its name, share and amount apart ("Web, 60%, 600").',
    notes: [
      "The blocks, the shares printed on them, the colour keys and the readout are hidden from assistive tech (`aria-hidden`); the value text, the key's names and the list's rows say the same.",
      "A screen reader's step (a swipe up or down, or a volume key) moves the slider as a key does, since it is a native input.",
      'An amount that isn’t a number reads `labels.noValue`, never "NaN".',
      'The value text follows the keys and a screen reader’s own steps, never the pointer hovering a focused bar.',
    ],
  },
  focus: [
    'A `SegmentedBar` is one tab stop. Keyboard focus draws the M3 focus indicator round the bar and shows the readout of the part it reads.',
    'A press or a tap on a part reads it and moves focus to the bar, without scrolling, so the arrow keys go on from that part.',
    'A `SegmentedList` adds no tab stops.',
  ],
  touchTarget: [
    "The bar is 28px tall (`--wm-segmented-height`), under 48px: it is read, never pressed to act, and a finger can slide along it. Everything it shows is also in the key, the value text and a frame's table view; raise the token where fingers need a taller bar.",
    'A `SegmentedList` has nothing to press.',
  ],
  motion: [
    'The parts grow to their shares when the bar first comes into view, and move to new shares when they change, on the default spatial spring. Under reduced motion they take their shares at once.',
    'While one part is read the others step back, dimming their colour on the fast effects spring, under reduced motion too: a fade is not movement.',
    "A bar on screen as the page hydrates shows its shares from the server's HTML and doesn't replay.",
  ],
  consumer: [
    'Name each bar or list with `aria-label` ("Visits by device"), or put it in a `ChartFrame`, whose title names it.',
    'Keep to two to five parts, largest first, so anything past six folds the smallest into "Other". Labels are text, never HTML.',
    'Use `ordered` only for parts with an order, and keep them to five.',
    'Keep `texture` on (it is, for two or more parts) where colour may not be told apart; the key names every part either way.',
    'Translate `labels.describePart`, `labels.parts`, `labels.other` and `labels.noValue`, or set them once for the app with a {@link LabelsProvider} (its `Chart` words).',
  ],
};
