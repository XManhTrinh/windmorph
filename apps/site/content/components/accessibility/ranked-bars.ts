import type { ComponentAccessibility } from './types';

export const rankedBars: ComponentAccessibility = {
  keyboard: {
    none: 'Ranked and funnel bars are lists of text with nothing to focus, so they have no keys.',
  },
  screenReader: {
    role: 'A list (`ul`), one item per row or step.',
    name: 'Named by `aria-label` or `aria-labelledby`, or in a `ChartFrame` by its title; a development build warns about one with no name.',
    states:
      'Each item reads its name and its amount as text, in the order drawn: largest first with the rest last, or a funnel\'s steps in their order. A funnel step after the first also reads its share of the step before ("65% of the step before", `labels.ofPrevious`).',
    notes: [
      'The bars are hidden from assistive tech (`aria-hidden`); the amounts say the same.',
      'An amount that isn\'t a number reads `labels.noValue` ("No value"), never "NaN".',
    ],
  },
  focus: {
    none: 'Nothing in them takes focus: every row is text.',
  },
  touchTarget: {
    none: 'They have nothing to press; every figure is printed beside its bar.',
  },
  motion: [
    'The bars grow from nothing one after another when the list first comes into view, then a change moves every bar at once, on the default spatial spring. Under reduced motion they take their lengths at once, with no stagger.',
    "A list on screen as the page hydrates shows its bars from the server's HTML and doesn't replay.",
  ],
  consumer: [
    'Name each list with `aria-label` ("Orders by city"), or put it in a `ChartFrame`, whose title names it.',
    'Mark the remainder with `rest` ("Everywhere else"), so it stays last and is read last.',
    "Keep a funnel's steps in the order people take them; it never sorts them.",
    'Labels are text, never HTML; a long one wraps rather than being cut, so it can say all it needs.',
    'Translate `labels.ofPrevious` and `labels.noValue`, or set them once for the app with a {@link LabelsProvider} (its `Chart` words).',
  ],
};
