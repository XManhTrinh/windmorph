import type { ComponentAccessibility } from './types';

export const divider: ComponentAccessibility = {
  keyboard: { none: 'A divider has no interaction, so it takes no keys.' },
  screenReader: {
    role: '`none` by default, which hides the line from assistive tech (M3: dividers are decorative); `separator` with `decorative={false}`.',
    name: 'None. A `LabeledDivider` keeps its supporting text readable as plain text after the line.',
    states:
      'With `decorative={false}`, a vertical divider reports `aria-orientation="vertical"`; a horizontal one uses the separator default.',
    notes: ['A `LabeledDivider` hides only its line; its text is always read.'],
  },
  focus: { none: 'A divider is not focusable.' },
  touchTarget: { none: 'A divider takes no presses, so it has no touch target.' },
  motion: { none: 'A divider has no motion.' },
  consumer: [
    'Leave the default for a purely visual line, for example between list items that already read as separate: assistive tech skips it.',
    'Set `decorative={false}` where the line marks a real break between groups of content, so screen readers announce a separator.',
  ],
};
