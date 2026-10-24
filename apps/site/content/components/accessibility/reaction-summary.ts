import type { ComponentAccessibility } from './types';

export const reactionSummary: ComponentAccessibility = {
  keyboard: [
    {
      keys: ['Tab'],
      action:
        'Moves focus to the summary when it is pressable (`onPress`), and on to the next element.',
    },
    {
      keys: ['Enter', 'Space'],
      action: 'Calls `onPress`, to open the list of who reacted.',
    },
  ],
  keyboardNotes: ["Without `onPress` it is plain text: it isn't focusable and has no keys."],
  screenReader: {
    role: 'A `button` with `onPress`; otherwise plain text.',
    name: '`labels.count(total, formatted)` ("1 reaction", "128 reactions", "1.3K reactions"): the button\'s name when pressable, or visually hidden text read in place of the icons and number. `formatted` is the compact number as shown; keep it in the words so the name contains the visible text.',
    states: 'None: it announces the count only.',
    notes: [
      'The icons and the compact number ("1.3K") are hidden from assistive tech (`aria-hidden`).',
      'Nothing renders when `total` is 0.',
    ],
  },
  focus: [
    "Pressable, it is in the Tab order where it sits and shows M3's focus indicator on keyboard focus: a 3px `secondary` outline 2px outside.",
  ],
  touchTarget: [
    'Pressable, it gets an invisible 48 × 48px touch target: the `stacked` button is 40px tall (`TouchTarget`), and the `chip` is the core {@link AssistChip}, 32px tall with its own 48px target.',
  ],
  motion: [
    'Pressable, the press ripple appears at full size without growing under reduced motion. Nothing else moves.',
  ],
  consumer: [
    "When it opens the list of who reacted, say so in `labels.count`, since that is the button's whole name: `` (total, formatted) => `${formatted} reactions. See who reacted` ``.",
    "Translate `labels.count`, with your language's plural forms (choose them from `total`).",
    'For a summary that opens who reacted in a dialog, pass `aria-haspopup="dialog"` (and `aria-expanded` / `aria-controls` while it is open).',
    'In forced-colours mode the chip keeps its border, and a pressable `stacked` summary draws a `CanvasText` border; keep `classNames` overrides from removing them.',
  ],
};
