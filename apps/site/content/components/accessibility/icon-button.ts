import type { ComponentAccessibility } from './types';

export const iconButton: ComponentAccessibility = {
  keyboard: [
    { keys: ['Tab'], action: 'Moves focus to the button, and on to the next element.' },
    { keys: ['Enter', 'Space'], action: 'Activates the button, or switches a toggle on or off.' },
    {
      keys: ['Enter'],
      action: 'Follows a link icon button (`href`).',
      where: 'With `href`',
    },
    { keys: ['Escape'], action: 'Hides the label tooltip while it shows.' },
  ],
  screenReader: {
    role: '`button`, or `link` when it has `href`.',
    name: '`aria-label` or `aria-labelledby`. One of them is required, since the button shows no text.',
    states:
      'Disabled, and pressed or not pressed for a toggle (`aria-pressed`). Inside a selection {@link ButtonGroup} the group holds the state. While `pending` it is unavailable (`aria-disabled="true"`) but still focusable.',
    notes: [
      'While `pending`, the name gains "Loading" (`labels.pending`): "Refresh, Loading"; the tooltip still shows only the `aria-label`. A button that turns pending while it has focus says its new name once, politely; nothing is announced when it ends.',
      'The icon, and `selectedIcon` while selected, is hidden from assistive tech (`aria-hidden`).',
      "The `aria-label` also shows in a plain tooltip on hover, keyboard focus and a touch long press. It only repeats the name, so it isn't linked as a description and the name is announced once.",
      'There is no built-in tooltip with `tooltip={false}`, inside a `TooltipTrigger` of your own, or when `aria-labelledby` names the button.',
    ],
  },
  focus: [
    "It is in the Tab order where it sits in the page. A disabled icon button can't be focused.",
    'A pending icon button keeps focus through the whole wait and stays in the Tab order: only its presses are blocked.',
    "Keyboard focus shows M3's focus indicator: a 3px `secondary` outline 2px outside the container, drawn as an `outline`, so a clipping parent never hides it. Pointer presses show no ring.",
  ],
  touchTarget: [
    'Medium, large and extra-large icon buttons (56, 96 and 136px tall, 48px wide or more) meet the 48px minimum.',
    'Extra-small and small icon buttons (32 and 40px tall, 28 to 52px wide) get an invisible 48 × 48px touch target inside the button; their layout size stays the same.',
    "With `density` (or the theme's), every size loses 4px of height and width a step (never below the icon plus 4px), and the 48 × 48px target stays: a medium icon button gets one too once it's under 48px. M3 asks not to apply density to icon buttons by default, and keeps the controls that change density at 48px: offer it as the reader's choice. Icon buttons in a text field's icon slots keep their size.",
  ],
  motion: [
    'Under reduced motion the press and selection morphs snap to their new corners, and the press ripple appears at full size without growing. Colours still fade.',
    'With `iconTransition="rotate"`, reduced motion keeps only the crossfade between `icon` and `selectedIcon`, without the turn.',
    'The pending swap is a crossfade, delayed 200ms so a quick action never flashes; it stays under reduced motion, where the loading indicator only rotates.',
  ],
  consumer: [
    'Name every icon button with an `aria-label` that says what it does ("Add to favourites", "Send message"), not what the icon shows.',
    'For a toggle, keep one label and let `aria-pressed` carry the state.',
    'Keep the icon at 3:1 contrast or more against what is behind it when you override colours.',
    "Set `pending` only while the action runs, don't also set `disabled` (it drops focus), and announce the result yourself.",
  ],
};
