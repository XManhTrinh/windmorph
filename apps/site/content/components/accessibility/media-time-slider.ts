import type { ComponentAccessibility } from './types';

export const mediaTimeSlider: ComponentAccessibility = {
  keyboard: [
    {
      keys: ['Arrow Right', 'Arrow Up'],
      action: 'Moves forward by `step` seconds (5 by default).',
    },
    { keys: ['Arrow Left', 'Arrow Down'], action: 'Moves back by `step` seconds.' },
    { keys: ['Page Up', 'Page Down'], action: 'Moves forward or back a tenth of the length.' },
    { keys: ['Home', 'End'], action: 'Goes to the start or the end.' },
  ],
  keyboardNotes: [
    'Right to left, Arrow Left moves forward and Arrow Right back, as the bar runs from the right.',
    'Each key calls `onChange` and `onChangeEnd`, so a player seeks once per key press.',
  ],
  screenReader: {
    role: 'A `slider` (a native range input) inside a `group`.',
    name: 'Named by `aria-label` or `aria-labelledby`, which its types require ("Position", or the title of what plays).',
    states:
      'Its value in words, `aria-valuetext`: "1 minute, 23 seconds of 10 minutes" in the locale\'s unit words, from `labels.position`; `valueText` writes your own. Disabled until the length is known.',
    notes: [
      'The time bubble, the bar and its loaded parts are hidden from assistive tech (`aria-hidden`); the value says the same.',
    ],
  },
  focus: [
    'One tab stop, the handle. Keyboard focus grows the bar, shows the handle with the M3 focus ring round it, and shows the bubble with its time.',
  ],
  touchTarget: [
    'The whole bar is a 48px tall target, however thin it draws; a press anywhere on it seeks there.',
  ],
  motion: [
    'The bar grows and the handle appears on the fast spatial spring; under reduced motion both change at once.',
    'The bubble fades in and out, under reduced motion too: a fade is not movement.',
  ],
  consumer: [
    'Name it with `aria-label` ("Position", "Seek") or `aria-labelledby` the title of what plays.',
    'Translate `labels.position`, or set it once for the app with a {@link LabelsProvider}; the unit words come from the locale.',
    'Seek in `onChangeEnd`, and keep updating `value` from the media as it plays.',
    'Leave about 40px above the bar for the bubble, or let it overflow.',
  ],
};
