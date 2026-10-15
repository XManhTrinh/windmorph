import type { ComponentAccessibility } from './types';

export const slider: ComponentAccessibility = {
  keyboard: [
    {
      keys: ['Tab'],
      action:
        'Moves focus to the thumb, and on to the next element. A range slider has two thumbs, each its own Tab stop.',
    },
    {
      keys: ['Arrow Right', 'Arrow Up'],
      action: 'Increases the value by `step`.',
    },
    {
      keys: ['Arrow Left', 'Arrow Down'],
      action: 'Decreases the value by `step`.',
    },
    {
      keys: ['Page Up', 'Page Down'],
      action:
        'Increases or decreases the value by a larger interval, a tenth of the range by default.',
    },
    {
      keys: ['Shift + Arrow Right', 'Space + Arrow Right'],
      action:
        'Holding Shift or Space while pressing any arrow key moves by the larger interval too.',
    },
    { keys: ['Home', 'End'], action: 'Moves the thumb to the minimum or the maximum.' },
  ],
  keyboardNotes: [
    'In a right-to-left layout Arrow Left and Arrow Right swap, so the arrow always points the way the thumb moves.',
    "The thumbs of a range slider can't pass each other.",
  ],
  screenReader: {
    role: '`group` around one `slider` per thumb: each thumb is a visually hidden native range input (React Aria `useSlider` / `useSliderThumb`).',
    name: '`aria-label`, or `aria-labelledby` pointing at a visible label; the types require one. A range slider adds each thumb\'s own name from `labels` (default "Minimum" and "Maximum"), after the slider\'s name.',
    states:
      'The value, minimum and maximum, the orientation (`aria-orientation`), and disabled. The announced value (`aria-valuetext`) is formatted with `formatOptions`.',
    notes: [
      'The track, stop indicators, ticks, inset icons and the value indicator pill are decorative and hidden from assistive tech (`aria-hidden`).',
    ],
  },
  focus: [
    "Each thumb is in the Tab order. A disabled slider can't be focused.",
    "Keyboard focus shows M3's focus indicator around the handle: a 3px `secondary` outline 2px outside it, with the gap to the track widened from 6px to 10px to make room. The handle narrows from 4px to 2px, as it does while dragged.",
    'With `showValueLabel`, the value indicator shows while a thumb is dragged or has keyboard focus. Pointer presses show no ring.',
  ],
  touchTarget: [
    'Pressing anywhere on the track moves the nearest thumb there, so the hit area is the full length of the track.',
    'It is as tall as the handle: 44px for XS and S, and 52, 68 and 108px for M, L and XL. An XS or S slider takes presses 2px past its edges on each side, so its hit area is 48px tall without changing its layout; leave 2px clear above and below it.',
  ],
  motion: {
    none: 'The slider has no animation: the thumb and tracks follow the value directly, so reduced motion changes nothing.',
  },
  consumer: [
    'Name every slider with `aria-label`, or `aria-labelledby` pointing at a visible label.',
    'For a range slider, pass `labels` when "Minimum" and "Maximum" don\'t fit, or to translate them.',
    'Pass `formatOptions` when the number alone is unclear (a percentage, a currency), so the value is announced with its unit.',
    'When the exact value matters, show it (`showValueLabel`, or a text field beside the slider) rather than relying on the track position.',
  ],
};
