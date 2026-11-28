import type { ComponentAccessibility } from './types';

export const popover: ComponentAccessibility = {
  keyboard: [
    {
      keys: ['Tab'],
      action:
        'Moves within the panel; focus stays inside while it’s open. With `modal={false}`, the panel follows its trigger in the Tab order: Tab from the trigger goes in, Tab from its last control on to what follows the trigger, and Shift + Tab the same way back (from what follows into its last control, from its first to the trigger). Arriving from anywhere else, the panel is passed over, so it’s visited once each way.',
    },
    {
      keys: ['Escape'],
      action:
        'Closes it, unless `closedBy` is `none`. With `modal={false}`, Escape in the anchor’s text closes it too, focus staying there.',
    },
  ],
  screenReader: {
    role: 'A `dialog`, with hidden dismiss buttons at its start and end for screen readers.',
    name: 'From `aria-label` or `aria-labelledby`, which the types require.',
    states: 'Its trigger has `aria-expanded` and `aria-controls`.',
  },
  focus: [
    'Focus moves in as it opens, to the first control or the panel.',
    'With `modal={false}` (a panel beside its anchor) focus isn’t held inside and nothing in the page is hidden or inert; focus or a press in the anchor keeps it open, and focus or a press anywhere else closes it. The full-screen form below 600px is always modal.',
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
