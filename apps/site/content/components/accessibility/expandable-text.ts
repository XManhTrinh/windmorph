import type { ComponentAccessibility } from './types';

export const expandableText: ComponentAccessibility = {
  keyboard: [
    {
      keys: ['Tab'],
      action: 'Moves focus to "See more" (or "See less"), and on to the next element.',
    },
    {
      keys: ['Enter', 'Space'],
      action:
        'On "See more", expands the text and moves focus to its start. On "See less", collapses it and returns focus to "See more".',
    },
  ],
  screenReader: {
    role: 'The text in a `div` (or `p` with `as="p"`); "See more" and "See less" are `button`s.',
    name: 'The buttons are named by their words, from `labels` (`more`, `less`).',
    states:
      'The buttons carry `aria-expanded` (false on "See more", true on "See less") and `aria-controls` pointing at the text.',
    notes: [
      'Screen readers read the whole text even while it is cut: the clamp is visual only, so nothing is hidden from them.',
      'Without JavaScript the full text shows, with no button.',
    ],
  },
  focus: [
    '"See more" shows only when the text is actually cut, and is in the Tab order after the text\'s own links. "See less" (with `collapsible`) follows the text.',
    'Pressing "See more" removes it and moves focus to the start of the text (focusable by script only, `tabIndex={-1}`) without scrolling, so the reader carries on from there. Pressing "See less" returns focus to "See more", or to the text if "See more" is not back, also without scrolling; only if the text\'s start is then above the window is it brought back into view.',
    "Keyboard focus shows M3's focus indicator: a 3px `secondary` outline 2px outside the button or the text. Pointer presses show no ring.",
  ],
  touchTarget: [
    'The buttons are one line of text tall, and each gets an invisible touch target 48px tall and at least 48px wide.',
  ],
  motion: [
    'Expanding and collapsing are instant, with no height animation. When "See less" brings the text\'s start back into view, the page scrolls smoothly, and at once under reduced motion.',
  ],
  consumer: [
    'Pass the button words through `labels` (`more`, `less`) so they come from your translations.',
    'Set `lang` when the text is in a different language from the page.',
    'In forced-colours mode the buttons use the system button colour (`ButtonText`), underlined; keep any `classNames.button` override from removing that.',
  ],
};
