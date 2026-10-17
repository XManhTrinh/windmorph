import type { ComponentAccessibility } from './types';

export const splitButton: ComponentAccessibility = {
  keyboard: [
    {
      keys: ['Tab', 'Shift + Tab'],
      action: 'Moves focus to the leading button, then to the trailing button, then on.',
    },
    {
      keys: ['Enter', 'Space'],
      action: 'Runs the leading action, or follows it when it has `href`.',
      where: 'On the leading button',
    },
    {
      keys: ['Enter', 'Space', 'Arrow Down'],
      action: 'Opens the menu with focus on its first item.',
      where: 'On the trailing button',
    },
    {
      keys: ['Arrow Up'],
      action: 'Opens the menu with focus on its last item.',
      where: 'On the trailing button',
    },
    {
      keys: ['Arrow Up', 'Arrow Down', 'Enter', 'Escape'],
      action:
        'Work as in any {@link Menu}: the arrows move between items, Enter chooses one, and Escape closes the menu.',
      where: 'In the menu',
    },
  ],
  screenReader: {
    role: 'Two `button`s side by side (the leading one is a `link` with `href`). The trailing button opens a `menu`.',
    name: 'The leading button is named by its label, or by `leadingLabel` when it shows only an icon. The trailing button is named by the required `menuLabel` ("More send options"), and the menu is named after it.',
    states:
      'The trailing button reports `aria-haspopup` and `aria-expanded` with a menu, `aria-expanded` alone when it opens its own overlay, and both halves report disabled.',
    notes: [
      'The leading icon and the chevron are hidden from assistive tech (`aria-hidden`).',
      'While the menu is open, the rest of the page, the split button included, is hidden from assistive tech.',
    ],
  },
  focus: [
    'Both halves are separate Tab stops, leading first.',
    "Keyboard focus shows M3's focus indicator on the focused half: a 3px `secondary` outline 2px outside it. Pointer presses show no ring.",
    'The menu takes focus when it opens and gives it back to the trailing button when it closes, as any {@link Menu} does. A mouse press opens the menu on release and focuses the trailing button first, so focus still returns there.',
  ],
  touchTarget: [
    'Medium, large and extra-large split buttons (56, 96 and 136px tall) are taller than 48px.',
    'At extra-small and small (32 and 40px tall), each half gets its own invisible 48px-tall touch target, at least 48px wide; their layout height stays the same.',
  ],
  motion: [
    'Under reduced motion the press and open morphs snap to their new corners, the chevron turns over at once instead of rotating, and the press ripple appears at full size without growing. Colours still fade.',
  ],
  consumer: [
    'Give `menuLabel` a name that ties the menu to the main action: "More send options" beside "Send", not "More".',
    'Pass `leadingLabel` when the leading button shows only an icon.',
    'Keep the menu to actions related to the leading one.',
  ],
};
