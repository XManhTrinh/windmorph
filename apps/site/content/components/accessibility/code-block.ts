import type { ComponentAccessibility } from './types';

export const codeBlock: ComponentAccessibility = {
  keyboard: [
    {
      keys: ['Tab'],
      action:
        'Moves to the copy button, then to the code itself, which takes focus so it can be scrolled.',
    },
    { keys: ['Enter', 'Space'], action: 'Copies the code.', where: 'On the copy button' },
    {
      keys: ['Arrow Left', 'Arrow Right'],
      action: 'Scrolls a long line sideways.',
      where: 'On the code',
    },
  ],
  screenReader: {
    role: 'The code is a `region` holding a `<pre>`; the copy button is a `button`.',
    name: 'The region is named by `title`, or by `labels.region` when there is none ("tsx code", or "Code" without `lang`). The copy button is named "Copy" (`labels.copy`), then "Copied" (`labels.copied`) for two seconds after a copy.',
    states: 'None.',
    notes: [
      'A copy is announced ("Copied") through a status region that is in the page from the start, so screen readers hear it.',
      "The copy button's icons are hidden; its name says what it does. Highlighting is only colour, so the code reads as plain text.",
    ],
  },
  focus: [
    'The code region takes focus with Tab (WCAG 2.1.1), so a keyboard can scroll a long line. It shows the M3 focus indicator inside its edges: a 3px `secondary` outline.',
    "The copy button is the core's {@link IconButton}, with its focus ring and its tooltip, which shows its name.",
    'Copying leaves focus on the copy button.',
  ],
  touchTarget: [
    'The copy button is a small standard {@link IconButton} with a 48 × 48px touch target, in a 48px header. It stays at density 0 in a dense theme.',
  ],
  motion: [
    "Nothing moves apart from the copy button's state layer and ripple, which follow {@link IconButton}: under reduced motion the ripple appears at full size without growing.",
  ],
  consumer: [
    'Give the block a `title` when the code is a file, so the region has a meaningful name; without one, pass `lang`.',
    "Highlight with colours from the M3 roles (the block maps Shiki's CSS variables to them), so every theme and contrast level keeps the text readable.",
    'Pass `labels` to translate the button names and the region name.',
  ],
};
