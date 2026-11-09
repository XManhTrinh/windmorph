import type { ComponentAccessibility } from './types';

export const popover: ComponentAccessibility = {
  keyboard: [
    { keys: ['Tab'], action: 'Moves within the panel; focus stays inside while it’s open.' },
    { keys: ['Escape'], action: 'Closes it, unless `closedBy` is `none`.' },
  ],
  screenReader: {
    role: 'A `dialog`, with hidden dismiss buttons at its start and end for screen readers.',
    name: 'From `aria-label` or `aria-labelledby`, which the types require.',
    states: 'Its trigger has `aria-expanded` and `aria-controls`.',
  },
  focus: [
    'Focus moves in as it opens, to the first control or the panel.',
    'It returns to the trigger as it closes, without scrolling the page.',
  ],
  touchTarget: [
    'Its trigger is yours, and below 600px wide the full-screen form’s close button has a 48px target.',
  ],
  motion: [
    'It reveals as a menu does, on the spatial spring, and only fades under reduced motion.',
  ],
  consumer: [
    'Give it a name.',
    'Use `closedBy="closerequest"` for a form, so a stray press outside doesn’t lose what was typed.',
  ],
};
