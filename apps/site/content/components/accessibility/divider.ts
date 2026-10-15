import type { ComponentAccessibility } from './types';

export const divider: ComponentAccessibility = {
  keyboard: { none: 'A divider has no interaction, so it takes no keys.' },
  screenReader: {
    role: '`separator` by default; `none` when `decorative` is set, which hides it from assistive tech.',
    name: 'None. A `LabeledDivider` keeps its supporting text readable as plain text after the line.',
    states:
      'A vertical divider reports `aria-orientation="vertical"`; a horizontal one uses the separator default.',
    notes: ['`decorative` on a `LabeledDivider` hides the line, not the text.'],
  },
  focus: { none: 'A divider is not focusable.' },
  touchTarget: { none: 'A divider takes no presses, so it has no touch target.' },
  motion: { none: 'A divider has no motion.' },
  consumer: [
    'Set `decorative` for a purely visual line, for example between list items that already read as separate, so assistive tech skips it.',
    'Keep the separator role where the line marks a real break between groups of content.',
  ],
};
