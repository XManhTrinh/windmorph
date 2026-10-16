import type { ComponentAccessibility } from './types';

export const skeleton: ComponentAccessibility = {
  keyboard: {
    none: 'Nothing in a skeleton is focusable, so it has no keys.',
  },
  screenReader: {
    role: 'Each `Skeleton` is hidden from assistive tech (`aria-hidden`). `SkeletonGroup` is a region marked `aria-busy="true"`, holding a `status` label.',
    name: 'The group\'s `label` ("Loading businesses"), read once as status text instead of announcing every placeholder.',
    states: '`aria-busy` on the group, for as long as it is on the page.',
    notes: [
      'With `as="ul"`, the label sits in its own visually hidden list item, so the list stays valid.',
      "The label's `status` region goes into the page a moment (100ms) before its text, so it is announced even when the group appears after the page has loaded.",
    ],
  },
  focus: {
    none: 'Skeletons never take focus, and a `SkeletonGroup` adds no focus stops.',
  },
  touchTarget: {
    none: 'A skeleton has nothing to press; it stands in for content until it loads.',
  },
  motion: [
    'Both animations, the pulse and the shimmer, stop under reduced motion, leaving a still fill: a still placeholder still reads as loading. `animation="none"` stops them for everyone.',
  ],
  consumer: [
    'Wrap skeletons in a `SkeletonGroup` with a `label` that says what is loading; a lone `Skeleton` is silent to screen readers.',
    "Replace the whole group with the content when it arrives, so `aria-busy` goes with it, and don't move focus into the placeholders.",
    'In forced-colours mode each placeholder keeps an outline, since backgrounds are removed; keep `classNames` overrides from removing it.',
  ],
};
