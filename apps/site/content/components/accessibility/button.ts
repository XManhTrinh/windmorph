import type { ComponentAccessibility } from './types';

export const button: ComponentAccessibility = {
  keyboard: [
    { keys: ['Tab'], action: 'Moves focus to the button, and on to the next element.' },
    { keys: ['Enter', 'Space'], action: 'Activates the button, or switches a toggle on or off.' },
    {
      keys: ['Enter'],
      action:
        'Follows a link button (`href`). Space scrolls the page, as it does on any link, rather than following it.',
      where: 'With `href`',
    },
  ],
  screenReader: {
    role: '`button`, or `link` when it has `href`.',
    name: 'Its visible label (`children`).',
    states:
      'Disabled, and pressed or not pressed for a toggle (`aria-pressed`). A link has no toggle form. While `pending` it is unavailable (`aria-disabled="true"`) but still focusable.',
    notes: [
      'While `pending`, the name gains "Loading" (`labels.pending`): "Save, Loading". A button that turns pending while it has focus says its new name once, politely; nothing is announced when it ends, so the app announces the result.',
      'The loading indicator itself is hidden from assistive tech: the name carries the state from the first frame, before the indicator appears.',
      'The leading icon is decorative and hidden from assistive tech (`aria-hidden`). M3 allows one icon, before the label, so there is no trailing icon.',
    ],
  },
  focus: [
    "It is in the Tab order where it sits in the page. A disabled button can't be focused.",
    'A pending button keeps focus through the whole wait and stays in the Tab order: it is not natively disabled, only its presses are blocked.',
    "Keyboard focus shows M3's focus indicator: a 3px `secondary` outline 2px outside the container, drawn as an `outline`, so a clipping parent never hides it. Pointer presses show no ring.",
  ],
  touchTarget: [
    'Medium, large and extra-large buttons (56, 96 and 136px tall) are taller than 48px.',
    'Extra-small and small buttons (32 and 40px tall) get an invisible 48 × 48px touch target inside the button; their layout height stays 32 or 40px.',
  ],
  motion: [
    'Under reduced motion the press and selection morphs snap to their new corners, and the press ripple appears at full size without growing. Colours and elevation still fade.',
    'The pending swap is a crossfade, delayed 200ms so a quick action never flashes; it stays under reduced motion, where the loading indicator only rotates.',
  ],
  consumer: [
    'Give every button a visible text label. For an icon-only action use `IconButton`, which requires an `aria-label`.',
    'For a toggle, keep the label true in both states (Star / Starred), or keep one label and let `aria-pressed` carry the state.',
    'Use `href` for navigation and `onPress` for actions, so the element and its keys match what it does.',
    "Set `pending` only while the action runs, and don't also set `disabled`, which drops focus to the page. Announce the result yourself (a snackbar, an error message, the next page).",
  ],
};
