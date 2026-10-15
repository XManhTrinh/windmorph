import type { ComponentAccessibility } from './types';

export const collapse: ComponentAccessibility = {
  keyboard: {
    none: "It has no keys of its own: what opens and folds it is the app's control, and the keys are that control's.",
  },
  screenReader: {
    role: 'A plain `div` with no role; its content keeps its own roles.',
    name: 'None: it is a wrapper, not a named region.',
    states:
      'None of its own. Open, the content is read as part of the page; folded, it is unmounted, so screen readers and Tab skip it.',
    notes: [
      'While it folds, the content it last showed stays on screen but is `inert`, so it is already out of reach.',
    ],
  },
  focus: [
    'Open, its content sits in the Tab order where the collapse is in the page. While folding it is `inert`, and once folded it is gone, so nothing in it can take focus.',
    'It moves no focus itself: opening does not focus the content, and folding does not return focus anywhere.',
  ],
  touchTarget: {
    none: "It has nothing to press; the control that opens it is the app's, with that control's own target.",
  },
  motion: [
    'Under reduced motion it only fades: the height (`grid-template-rows`) no longer animates, so the content appears and goes in place. Content shown from the start (`appear={false}`) does not animate at all.',
  ],
  consumer: [
    'What opens it is yours. For a disclosure, make it a button with `aria-expanded` and `aria-controls` pointing at the content.',
    'If focus is inside the content when you fold it (after sending a reply, say), focus is lost as it turns `inert`; move focus back to the control that opened it.',
    'When opening it reveals a field the person asked for (a reply field), move focus into it yourself.',
  ],
};
