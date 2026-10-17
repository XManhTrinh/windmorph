import type { ComponentAccessibility } from './types';

export const link: ComponentAccessibility = {
  keyboard: [
    { keys: ['Tab'], action: 'Moves focus to the link, and on to the next element.' },
    { keys: ['Enter'], action: 'Follows the link.', where: 'With `href`' },
    {
      keys: ['Enter', 'Space'],
      action: "Presses it: it is a button with the link's look.",
      where: 'With `onPress`',
    },
  ],
  screenReader: {
    role: '`link` (an `a`), or `button` with `onPress` and no `href`.',
    name: 'Its text (`children`), or `aria-label` for non-text content such as a logo.',
    states:
      'None. An `external` link, or one with `target="_blank"`, adds "opens in a new tab" after its text (`labels.newTab`).',
    notes: [
      'The "open in new" icon on an external link is decorative and hidden from assistive tech.',
    ],
  },
  focus: [
    'It is in the Tab order where it sits in the text.',
    "Keyboard focus shows M3's focus indicator: a 3px `secondary` outline 2px outside the link. A `standalone` link also underlines while focused. Pointer presses show no ring.",
  ],
  touchTarget: [
    'A `standalone` link, on a line of its own, has an invisible 48 × 48px touch target (`TouchTarget`) around its text, in an inline wrapper so the underline still reaches the text.',
    'An `inline` or `plain` link is as tall as its line of text and has no extended target, as text links in running text usually do not; WCAG 2.5.8 exempts links inside a sentence. Give a `plain` link that stands alone (a logo, a photo tile) room of its own.',
  ],
  motion: {
    none: 'It has no animation: the underline appears and goes without a transition.',
  },
  consumer: [
    'Links in text are underlined (`inline`, WCAG 1.4.1); `standalone` links underline on hover, focus and press. `plain` links never underline, so keep them for non-text content such as a logo or a photo tile, and name them with `aria-label`.',
    'Write link text that says where it goes out of context; avoid "click here".',
    'Use `href` to go somewhere and `onPress` to do something, so the element and its keys match. Translate "opens in a new tab" with `labels.newTab`.',
    'In forced-colours mode links use the system link colour (`LinkText`) and are always underlined.',
  ],
};
