import type { ComponentAccessibility } from './types';

export const tag: ComponentAccessibility = {
  keyboard: [
    {
      keys: ['Tab'],
      action:
        'Reaches a tag only while its visible text is shorter than its full text (a `fullLabel`, or a label cut short at `maxWidth`), and shows the full text in a tooltip. Any other tag is skipped.',
    },
    { keys: ['Escape'], action: 'Hides the tooltip.', where: 'On a focused tag' },
  ],
  screenReader: {
    role: 'None: a tag is a plain `span` read as text. `TagGroup` is a list (`ul` with an `li` per tag).',
    name: 'Its label, or `fullLabel` in its place when the label is short ("M3E" reads "Expressive"). A `TagGroup` is named by its `aria-label`.',
    states: 'None. In a `TagGroup`, screen readers say how many tags the list holds.',
    notes: [
      'The status dot and the leading icon are decorative and hidden from assistive tech (`aria-hidden`).',
      "The tooltip of a short or cut tag is the core's plain tooltip, linked to the tag as its description (`aria-describedby`) while it shows.",
    ],
  },
  focus: [
    "A tag takes focus only to show its full text (a `fullLabel`, or a label cut at `maxWidth`), with M3's focus indicator on keyboard focus; otherwise it never takes focus. A `TagGroup` adds no focus stops of its own.",
  ],
  touchTarget: [
    'A tag has nothing to press. Its height (20, 24 or 32px, a minimum that grows with larger text) is not a touch target.',
    'A small (`sm`) tag that takes focus for its tooltip gets a 24px touch target around its label (WCAG 2.5.8), so a long press opens the tooltip; its layout size stays the same.',
  ],
  motion: [
    'Colours ease on the default effects spring when the variant or tone changes, and change at once under reduced motion.',
  ],
  consumer: [
    'Let the label carry the meaning: the dot and the tone colour are not read, so "Open now" must say it in words.',
    'Pass `fullLabel` for an abbreviation; it replaces the short label for screen readers and shows in a tooltip on hover, keyboard focus or a long press. A label cut by `maxWidth` shows its full text the same way.',
    'Give `TagGroup` an `aria-label` that says what the tags describe ("Job details").',
    'Use {@link AssistChip} or {@link FilterChip} when it should do something when pressed, and {@link Badge} for a count.',
    'In forced-colours mode every tag keeps a border and its dot uses the system text colour; keep `classNames` overrides from removing them.',
  ],
};
