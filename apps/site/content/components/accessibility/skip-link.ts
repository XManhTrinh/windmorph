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
    "Keyboard focus shows M3's focus indicator, as on every core {@link Button}: a 3px `secondary` outline 2px outside the link.",
    'Pressing it also scrolls the target into view, on purpose: the reader asked to go there.',
  ],
  touchTarget: [
    'It is the core filled {@link Button} at its small size: 40px tall, with an invisible 48 × 48px touch target.',
  ],
  motion: [
    'It slides in on the fast spatial spring. Under reduced motion it fades in on the effects spring instead.',
    'The press ripple and state layer follow {@link Button}: under reduced motion the ripple appears at full size without growing.',
  ],
  consumer: [
    'Put it first in the page, before the top bar, and give the content an id: `<main id="main">` with `target="main"`.',
    'Give it a label in the page\'s language ("Skip to content").',
    'Under a sticky top bar, move it with `className` (on its fixed wrapper) so it shows below the bar, not hidden behind it.',
  ],
};
