import type { ComponentAccessibility } from './types';

export const loadingIndicator: ComponentAccessibility = {
  keyboard: {
    none: "It isn't focusable and has no keyboard interaction: it only shows that something is loading.",
  },
  screenReader: {
    role: '`progressbar` (React Aria `useProgressBar`).',
    name: 'The required `aria-label` or `aria-labelledby`: the types reject an indicator with neither.',
    states:
      'Indeterminate by default, with no `aria-valuenow`. With `value` it is determinate: `aria-valuemin` 0, `aria-valuemax` 1, `aria-valuenow` the value and `aria-valuetext` a percentage (`40%`).',
    notes: ['The shape is drawn in an `<svg>` hidden from assistive tech (`aria-hidden`).'],
  },
  focus: { none: 'It never takes focus, so it has no focus order or focus ring.' },
  touchTarget: { none: "It isn't interactive, so it needs no touch target." },
  motion: [
    'Under reduced motion the indeterminate indicator only rotates, at a steady speed, holding its first shape: no morphs and no springy quarter turns.',
    'A determinate indicator draws whatever `value` gives it, so it moves only as the value changes.',
  ],
  consumer: [
    'Name what is loading (`aria-label="Loading messages"`, `"Refreshing page"`), not just "Loading".',
    'Keep the indicator at 3:1 contrast against what it sits on. Recolour it only with roles that keep that contrast.',
    "Don't switch one indicator from indeterminate to determinate. For work whose progress becomes known, use a progress indicator ({@link LinearProgressIndicator} or {@link CircularProgressIndicator}).",
  ],
};
