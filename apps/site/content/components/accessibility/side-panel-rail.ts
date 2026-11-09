import type { ComponentAccessibility } from './types';

export const sidePanelRail: ComponentAccessibility = {
  keyboard: [
    { keys: ['Tab'], action: 'Moves through the items, then to the toggle.' },
    { keys: ['Enter'], action: 'Follows a link, or presses a button or the toggle.' },
    { keys: ['Space'], action: 'Presses a button or the toggle.' },
  ],
  keyboardNotes: ['While hidden, the items are out of the tab order and only the toggle remains.'],
  screenReader: {
    role: 'A `navigation` region holding links or buttons.',
    name: 'The region from `aria-label` or `aria-labelledby`, each item from its text, and the toggle from `labels.hide` or `labels.show`.',
    states:
      'The toggle reports `aria-expanded`. A selected link is `aria-current="page"`; a selected button is `aria-pressed`.',
    notes: ['An item’s name shows in a tooltip, which only repeats it, so it isn’t a description.'],
  },
  focus: [
    'If the strip hides while focus is on an item, focus moves to the toggle, so it never drops to the page.',
    'Keyboard focus shows the ring on the tab and doesn’t widen it.',
  ],
  touchTarget: [
    'Items and the open toggle have 48px targets.',
    'The hidden tab is 24px wide for a pointer, which meets WCAG 2.5.8, and 48 by 48 on a touch screen.',
  ],
  motion: [
    'The strip, tab and chevron move together on the default spatial spring.',
    'Under reduced motion nothing moves; the items’ fade and the colours stay, since a fade isn’t movement.',
  ],
  consumer: [
    'Name the region with `aria-label` or `aria-labelledby`, which the types require.',
    'Below `hideBelow` the strip is gone, so offer its destinations somewhere else, such as the app’s drawer.',
    'When an item opens a sheet, add `aria-expanded` and `aria-controls` if the sheet is the item’s disclosure.',
  ],
};
