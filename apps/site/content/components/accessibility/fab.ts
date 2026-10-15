import type { ComponentAccessibility } from './types';

export const fab: ComponentAccessibility = {
  keyboard: [
    { keys: ['Tab'], action: 'Moves focus to the FAB, and on to the next element.' },
    { keys: ['Enter', 'Space'], action: "Runs the FAB's action." },
    {
      keys: ['Enter'],
      action: 'Follows a link FAB (`href`).',
      where: 'With `href`',
    },
    { keys: ['Escape'], action: 'Hides the label tooltip while it shows.' },
  ],
  screenReader: {
    role: '`button`, or `link` when it has `href`.',
    name: '`Fab`: `aria-label` or `aria-labelledby`, one of which is required, since it shows no text. `ExtendedFab`: its visible label, which stays its name while collapsed to the icon.',
    states:
      'None of its own: M3 FABs have no disabled or toggle state, so the types leave out `disabled` and `toggle`.',
    notes: [
      'The icon is hidden from assistive tech (`aria-hidden`).',
      "A `Fab` shows its `aria-label` in a plain tooltip on hover, keyboard focus and a touch long press. While the tooltip shows it is linked as the FAB's description (`aria-describedby`), so a screen reader can hear the name twice. There is none with `tooltip={false}` or with only `aria-labelledby`.",
      'An `ExtendedFab` shows its label in a tooltip only while collapsed; expanded, the label is visible and there is no tooltip. Inside your own `TooltipTrigger` it steps aside.',
      'A hidden FAB (`visible={false}`) is `inert`, so it leaves the Tab order and the accessibility tree.',
    ],
  },
  focus: [
    'It is in the Tab order where it sits in the DOM, wherever it is drawn on screen.',
    "Keyboard focus shows M3's focus indicator: a 3px `secondary` outline 2px outside the container, drawn as an `outline`, so a clipping parent never hides it. Pointer presses show no ring.",
    'Collapsing or expanding an `ExtendedFab` never remounts it, so it keeps focus.',
  ],
  touchTarget: [
    'Every FAB is 56px or larger in both directions (56, 80 or 96px), and an extended FAB is at least as wide as it is tall, so all meet the 48px minimum without an extra touch target.',
  ],
  motion: [
    'Under reduced motion, hiding and showing (`visible`, `appear`) only fade, without the scale from the centre, and the press ripple appears at full size without growing. Colours and elevation still fade.',
    "Every spring switches to the standard scheme, which doesn't overshoot. An `ExtendedFab`'s label still slides closed and open on it.",
  ],
  consumer: [
    'Name a `Fab` with an `aria-label` that says the action ("Compose a new message"), not the icon.',
    'Give an `ExtendedFab` an `aria-label` only to add detail, and start it with the visible label\'s first word ("Create a new invite" for "Create").',
    "Pass `tooltip={false}` to a `Fab` you wrap in your own `TooltipTrigger`: unlike `ExtendedFab`, it doesn't step aside on its own.",
    "Hide the FAB (`visible={false}`) when its action isn't available, rather than disabling it.",
    'Place it in the DOM where it should come in the focus order, and keep it from covering another control and its focus ring.',
  ],
};
