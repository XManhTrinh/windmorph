import type { ComponentAccessibility } from './types';

export const collapse: ComponentAccessibility = {
  keyboard: {
    none: "It has no keys of its own: what opens and folds it is the app's control, and the keys are that control's.",
  },
  screenReader: {
    role: 'A plain `div` with no role; its content keeps its own roles.',
    name: 'None: it is a wrapper, not a named region.',
    states:
      'None of its own. Open, the content is read as part of the page; folded, it is unmounted, or with `keepMounted` kept as `hidden="until-found"`, so screen readers and Tab skip it either way.',
    notes: [
      'While it folds, the content it last showed stays on screen but is `inert`, so it is already out of reach.',
      'With `keepMounted`, find-in-page and a `#fragment` link still find the folded content, and it opens at once (calling `onOpenChange`) so the browser can scroll to the match. A page opened at a `#fragment` inside it, or a hash change to one, opens it and scrolls there.',
    ],
  },
  focus: [
    'Open, its content sits in the Tab order where the collapse is in the page. While folding it is `inert`, and once folded it is gone or hidden, so nothing in it can take focus.',
    'It moves no focus itself: opening does not focus the content, and folding does not return focus anywhere.',
  ],
  touchTarget: {
    none: "It has nothing to press; the control that opens it is the app's, with that control's own target.",
  },
  motion: [
    "Under reduced motion the height no longer animates: an opening collapse appears at full height and fades in, and a folding one fades out where it is, over `--wm-collapse-fade-duration`, then goes (`onExited` runs when the fade ends). One that folds as another opens goes at once, so what's below shifts once. Content shown from the start (`appear={false}`) does not animate.",
  ],
  consumer: [
    'What opens it is yours. For a disclosure, make it a button with `aria-expanded` and `aria-controls` pointing at the content.',
    'With `keepMounted`, pass `onOpenChange` so your control knows when find-in-page opened it, and keep its `aria-expanded` in step.',
    'If focus is inside the content when you fold it (after sending a reply, say), focus is lost as it turns `inert`; move focus back to the control that opened it.',
    'When opening it reveals a field the person asked for (a reply field), move focus into it yourself.',
    'For a stack of headers and panels, use Accordion, which does all of this for you.',
  ],
};
