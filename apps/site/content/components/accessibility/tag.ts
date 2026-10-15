import type { ComponentAccessibility } from './types';

export const tag: ComponentAccessibility = {
  keyboard: {
    none: 'A tag is static text: it is never focusable and has no keys.',
  },
  screenReader: {
    role: 'None: a tag is a plain `span` read as text. `TagGroup` is a list (`ul` with an `li` per tag).',
    name: 'Its label, or `fullLabel` in its place when the label is short ("M3E" reads "Expressive"). A `TagGroup` is named by its `aria-label`.',
    states: 'None. In a `TagGroup`, screen readers say how many tags the list holds.',
    notes: [
      'The status dot and the leading icon are decorative and hidden from assistive tech (`aria-hidden`).',
    ],
  },
  focus: {
    none: 'A tag never takes focus, and a `TagGroup` adds no focus stops.',
  },
  touchTarget: {
    none: 'A tag has nothing to press. Its 20, 24 or 32px height is not a touch target.',
  },
  motion: [
    'Colours ease on the default effects spring when the variant or tone changes, and change at once under reduced motion.',
  ],
  consumer: [
    'Let the label carry the meaning: the dot and the tone colour are not read, so "Open now" must say it in words.',
    'Pass `fullLabel` for an abbreviation; it replaces the short label for screen readers and shows on hover (`title`). A label cut by `maxWidth` also shows its full text on hover.',
    'Give `TagGroup` an `aria-label` that says what the tags describe ("Job details").',
    'Use {@link AssistChip} or {@link FilterChip} when it should do something when pressed, and {@link Badge} for a count.',
    'In forced-colours mode every tag keeps a border and its dot uses the system text colour; keep `classNames` overrides from removing them.',
  ],
};
