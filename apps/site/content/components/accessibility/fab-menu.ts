import type { ComponentAccessibility } from './types';

export const fabMenu: ComponentAccessibility = {
  keyboard: [
    {
      keys: ['Enter', 'Space'],
      action:
        'Opens or closes the menu from the button; focus stays on the button. On an item, runs it and closes the menu.',
    },
    {
      keys: ['Tab'],
      action:
        'Moves from the button to the top item, down through the items, then out of the menu, which stays open.',
    },
    {
      keys: ['Arrow Down'],
      action:
        'Moves focus from the button to the top item, then down through the items; from the bottom item it returns to the button.',
      where: 'While open',
    },
    {
      keys: ['Arrow Up'],
      action: 'Moves focus up through the items; from the top item it returns to the button.',
      where: 'While open',
    },
    {
      keys: ['Escape'],
      action: 'Closes the menu and puts focus on the button.',
      where: 'While open',
    },
    {
      keys: ['Enter', 'Space', 'Arrow Down', 'Arrow Up', 'Escape'],
      action:
        'With `presentation="menu"` the keys are those of any {@link Menu}: the button opens it with focus on the first item (Arrow Up: the last), the arrows move between items, typing jumps to an item, and Escape closes it.',
      where: 'Menu presentation',
    },
  ],
  screenReader: {
    role: 'The toggle is a `button`; in the list each item is a `button` (a `link` with `href`). With `presentation="menu"` the button opens a `menu` of `menuitem`s.',
    name: 'The button takes `aria-label` or `aria-labelledby`, one of which is required; each item is named by its label. The menu presentation names the `menu` with the same label.',
    states:
      'In the list, the button reports `aria-expanded` and `aria-controls` (the list). With `presentation="menu"` it reports `aria-haspopup` and `aria-expanded`.',
    notes: [
      'The button and item icons are hidden from assistive tech (`aria-hidden`).',
      'While closed, the button shows its `aria-label` in a plain tooltip on hover, keyboard focus and a touch long press. Open, it is the close button and has none. It steps aside inside your own `TooltipTrigger`, and `tooltip={false}` turns it off.',
      'Hidden items are `inert`, so they are out of the Tab order and the accessibility tree while the menu is closed. A hidden menu (`visible={false}`) is `inert` as a whole.',
    ],
  },
  focus: [
    'Opening keeps focus on the button, which becomes the close button. The DOM order is the button, then the items from the top down, even though the items show above the button.',
    'Choosing an item, or Escape, closes the menu and puts focus back on the button. An outside press closes it without moving focus.',
    "Keyboard focus shows M3's focus indicator on the button and on each item: a 3px `secondary` outline 2px outside it. The list keeps 16px of room around its items, so their rings aren't clipped when it scrolls.",
  ],
  touchTarget: [
    'The button is 56, 80 or 96px square, and 56px open; each item is a 56px-tall pill at least 56px wide. All meet the 48px minimum without an extra touch target.',
  ],
  motion: [
    'Under reduced motion, hiding and showing the menu (`visible`, `appear`) only fade, without the scale from the centre; the `swap` icon change happens at once, and `rotate` keeps only the crossfade. The press ripple appears at full size without growing.',
    "Opening and closing don't move either: the button becomes the close button at once, and the items fade in and out together, at their full width, without the stagger.",
  ],
  consumer: [
    'Name the button with an `aria-label` that says what the menu holds ("Create"), and give every item a visible label.',
    'Give the menu two to six related actions. For a single action use a {@link Fab}.',
    'Use `presentation="menu"` in large windows and on the web, where M3 asks for a standard menu.',
  ],
};
