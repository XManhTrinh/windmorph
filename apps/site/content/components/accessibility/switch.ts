import type { ComponentAccessibility } from './types';

export const switchControl: ComponentAccessibility = {
  keyboard: [
    { keys: ['Tab'], action: 'Moves focus to the switch, and on to the next element.' },
    {
      keys: ['Space', 'Enter'],
      action:
        'Switches it on or off. The thumb grows while the key is down, and the switch changes when the key is released.',
    },
  ],
  keyboardNotes: [
    'A native checkbox toggles on Space only; the switch adds Enter, as M3 asks for both keys.',
  ],
  screenReader: {
    role: '`switch`: a visually hidden native `<input type="checkbox">` with `role="switch"` (React Aria `useSwitch`), so forms and assistive tech work natively.',
    name: 'Its label (`children`), or `aria-label` / `aria-labelledby` when there is no visible label. The types require one of the three.',
    states:
      'On or off (`checked`), disabled, and read-only (`aria-readonly`) when `readOnly` is set.',
    notes: [
      'The thumb, its icons (`icons`, `selectedIcon`, `unselectedIcon`) and the state layer are decorative and hidden from assistive tech (`aria-hidden`).',
    ],
  },
  focus: [
    "It is in the Tab order where it sits in the page. A disabled switch can't be focused; a read-only one can be focused but not changed.",
    "Keyboard focus shows M3's focus indicator around the track: a 3px `secondary` outline 2px outside it, and the thumb takes its hover colour. Pointer presses show no ring.",
  ],
  touchTarget: [
    'The track is 52 × 32px. An invisible `TouchTarget` makes its hit area 52 × 48px without changing the layout, and the whole `<label>`, text included, toggles the switch.',
    "`density` (or the theme's) only shrinks the state layer around the thumb, 40px to 32px; the track and the 52 × 48px target stay.",
  ],
  motion: [
    'Under reduced motion the thumb jumps to the other end and changes size at once; its colours still fade. The press ripple appears at full size without growing. Pressing or dragging snaps the thumb in every mode.',
  ],
  consumer: [
    'Give every switch a name: visible `children`, or `aria-label` / `aria-labelledby` when the label is elsewhere.',
    'Keep the label the same in both states (Wi-Fi, not Wi-Fi on / Wi-Fi off); the switch announces its own state.',
    'Use a switch for a setting that takes effect at once. For a choice submitted later with a form, or one that needs an indeterminate state, use {@link Checkbox}.',
  ],
};
