import type { ComponentAccessibility } from './types';

export const emptyState: ComponentAccessibility = {
  keyboard: {
    none: 'It has no keys of its own; its actions are {@link Button}s with theirs.',
  },
  screenReader: {
    role: 'A plain `div` (or a {@link Card} for the card variants); `status` with `announce`.',
    name: 'None of its own: the title and description are read as its text. With `titleAs="h2"` (or `h3`, `h4`) the title is a heading.',
    states: 'None.',
    notes: [
      'The icon is decorative and hidden from assistive tech (`aria-hidden`).',
      "With `announce`, it is a `status` live region that goes into the page a moment (100ms) before its title and description, so they are read politely when it replaces results after a search or filter. One in the server's HTML shows at once.",
    ],
  },
  focus: [
    'Only its actions take focus, in the Tab order after the description. It moves no focus when it appears.',
  ],
  touchTarget: [
    'It has nothing to press itself. Its actions keep their own {@link Button} targets: 48 × 48px at the least, through an invisible touch target on the small sizes.',
  ],
  motion: [
    'It fades in on the default effects spring as it appears, under reduced motion too: a fade is not movement.',
  ],
  consumer: [
    'Write a title that says what is missing ("No results"), and a description that says why or what to do; the icon and its colour are not read.',
    "Use `titleAs` for a heading when the empty state is a section's only content, so the page outline stays whole.",
    'Set `announce` when the empty state replaces content after a search or filter, so screen-reader users hear the result.',
    'In forced-colours mode the icon keeps the text colour.',
  ],
};
