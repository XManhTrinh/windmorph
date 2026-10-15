import type { ComponentAccessibility } from './types';

export const card: ComponentAccessibility = {
  keyboard: [
    {
      keys: ['Tab'],
      action:
        "Moves focus to a pressable or link card. A static card isn't focusable; Tab goes to its own buttons and links.",
    },
    {
      keys: ['Enter', 'Space'],
      action: 'Activates a pressable card (`onPress`).',
      where: 'Pressable card',
    },
    {
      keys: ['Enter'],
      action: 'Follows a link card (`href`). Space scrolls the page, as on any link.',
      where: 'Link card',
    },
  ],
  screenReader: {
    role: 'A static card is a plain `div` with no role. A pressable card is a `div` with `role="button"`, because a `<button>` can\'t hold headings or media; a link card is a `link` (`<a>`).',
    name: 'For a pressable or link card, `aria-labelledby` pointing at its headline, or `aria-label`. Without either, the name is all of its text read together.',
    states: 'Disabled (`aria-disabled`) on a pressable card.',
    notes: ["A static card's content is read in order, like any other content."],
  },
  focus: [
    "A pressable or link card is one Tab stop where it sits in the page. A disabled card can't be focused.",
    "Keyboard focus shows M3's focus indicator: a 3px `secondary` outline 2px outside the card, drawn as an `outline` so the card's own clipping never hides it. An outlined card's border also darkens to `on-surface`. Pointer presses show no ring.",
  ],
  touchTarget: [
    "An interactive card is as large as its content and fills its container's width, so it is well over 48 × 48px in practice. It has no `TouchTarget`; keep a pressable card at least 48px tall.",
  ],
  motion: [
    'Under reduced motion the press ripple of an interactive card appears at full size without growing. Colours and elevation still fade.',
  ],
  consumer: [
    'Name a pressable or link card with `aria-labelledby` pointing at its headline (or `aria-label`), so it is announced by its title and not by all of its text.',
    "Don't put buttons, links or fields inside a pressable or link card: interactive content can't nest. In development the card warns when it finds any. Use a static card with its own actions instead.",
    'Use `href` for a card that navigates and `onPress` for one that runs an action.',
    'Give images in a card an `alt` text, or `alt=""` when the headline already says what they show.',
  ],
};
