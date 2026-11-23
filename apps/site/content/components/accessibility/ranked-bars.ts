import type { ComponentAccessibility } from './types';

export const rankedBars: ComponentAccessibility = {
  keyboard: {
    none: 'Ranked and funnel bars are lists of text with nothing to focus, so they have no keys.',
  },
  screenReader: {
    role: "`RankedBars` is a list (`ul`), one item per row; `FunnelBars` is an ordered list (`ol`), one item per step, since its steps' order is the meaning.",
    name: 'Named by `aria-label` or `aria-labelledby`, or in a `ChartFrame` by its title; a development build warns about one with no name.',
    states:
      'Each item reads its name and its amount as text, apart ("Paris, 1,204"), in the order drawn: largest first with the rest last, or a funnel\'s steps in their order. A funnel step after the first also reads its share of the step before ("Paid, 548, 90% of the step before", `labels.ofPrevious`).',
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
    'Translate `labels.ofPrevious`, `labels.noValue` and `labels.listSeparator` (what screen readers hear between a row’s name and its figures, ", " by default), or set them once for the app with a {@link LabelsProvider} (its `Chart` words).',
    'In forced-colours mode every bar is `CanvasText` and the rest row’s bar `Canvas` with `CanvasText` dots and a 1px `CanvasText` outline, while names, amounts and a funnel’s shares take the system text colour; the rest row is told apart by its name and its place, last, too. Keep `classNames` overrides from removing them.',
  ],
};
