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
    name: '`labels.count(total)` ("1 reaction", "128 reactions"): the button\'s name when pressable, or visually hidden text read in place of the icons and number.',
    states: 'None: it announces the count only.',
    notes: [
      'The icons and the compact number ("1.2K") are hidden from assistive tech (`aria-hidden`).',
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
    'When it opens the list of who reacted, say so in `labels.count` ("128 reactions. See who reacted"), since that is the button\'s whole name.',
    'Translate `labels.count`, with the plural forms your language needs.',
    'In forced-colours mode the chip keeps its border, and a pressable `stacked` summary draws a `CanvasText` border; keep `classNames` overrides from removing them.',
  ],
};
