import type { ComponentAccessibility } from './types';

export const shapedIcon: ComponentAccessibility = {
  keyboard: { none: "It isn't interactive, so it takes no keys and is never focused." },
  screenReader: {
    role: 'None by default: the icon is decorative and hidden (`aria-hidden`). With `aria-label` it is an `img`.',
    name: 'Its `aria-label`, when given.',
    states: 'None.',
  },
  focus: { none: "It isn't interactive, so it never takes focus." },
  touchTarget: { none: "It isn't interactive, so it has no touch target." },
  motion: { none: "It doesn't move: the shape is a static mask." },
  consumer: [
    'Leave it decorative when the text beside it says what it means, as in a step or an empty state.',
    'When the icon means something on its own, give it an `aria-label`: it becomes an image with that name.',
    "Each tone draws the icon in its container's paired content role (`on-secondary-container` on `secondary-container`, and so on), which M3 keeps at 3:1 contrast or more in every scheme and contrast level. Keep any colour override to such a pair.",
    'In forced-colours mode the icon takes the system text colour (`CanvasText`); keep `classNames` overrides from removing it.',
  ],
};
