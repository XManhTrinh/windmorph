import type { ComponentAccessibility } from './types';

export const skipLink: ComponentAccessibility = {
  keyboard: [
    {
      keys: ['Tab'],
      action:
        'The first Tab in the page lands on it and shows it at the top of the window. The next Tab moves on (to the next skip link, if there are several).',
    },
    {
      keys: ['Enter'],
      action:
        'Moves focus to the target, so the next Tab continues from there. The hash stays out of the URL, so Back does not stop on it.',
    },
  ],
  keyboardNotes: [
    'Several in a row (content, search) show one at a time, in the same place, as each takes focus.',
    'Without JavaScript it is a plain `#target` link, which still works.',
  ],
  screenReader: {
    role: '`link` (an `a` with `href="#target"`).',
    name: 'Its label (`children`), for example "Skip to content".',
    states: 'None.',
  },
  focus: [
    'It is off screen until it takes focus, then fixed at the top start of the window, above other content. It leaves the screen again when focus moves on.',
    'Pressing it focuses the target, giving it `tabindex="-1"` first if it cannot take focus already. A target that is already focusable keeps its own `tabindex`.',
    "Keyboard focus shows M3's focus indicator: a 3px `secondary` outline 2px outside the link.",
  ],
  touchTarget: [
    'It is 48px tall, the minimum, and as wide as its label plus 24px padding on each side.',
  ],
  motion: [
    'It slides in on the fast spatial spring. Under reduced motion it appears at once instead.',
  ],
  consumer: [
    'Put it first in the page, before the top bar, and give the content an id: `<main id="main">` with `target="main"`.',
    'Give it a label in the page\'s language ("Skip to content").',
  ],
};
