import type { ComponentAccessibility } from './types';

export const topAppBar: ComponentAccessibility = {
  keyboard: [
    {
      keys: ['Tab'],
      action:
        'Moves focus through the navigation icon, the actions and the `bottom` row, in that order.',
    },
    { keys: ['Enter', 'Space'], action: 'Activates the focused control.' },
  ],
  keyboardNotes: ['The bar adds no keys of its own; each control keeps its own keys.'],
  screenReader: {
    role: 'A `header` element, which is a `banner` landmark when it is not inside `article`, `aside`, `main`, `nav` or `section`.',
    name: "The bar itself has no name, and it doesn't name the page: wrap `title` in a heading when it is the page's name.",
    states: 'None of its own; its controls announce their own states.',
    notes: [
      'A medium or large bar renders the title twice, but only one is announced at a time: the expanded title until the bar is half collapsed, then the top-row one (the other is `aria-hidden`), so the title is never read twice.',
      'A bar scrolled fully off screen is `inert`, so it leaves the accessibility tree until it comes back.',
    ],
  },
  focus: [
    'Its controls are in the Tab order where the bar sits in the page, so the navigation icon is the first stop, as M3 asks.',
    'Each control shows its own focus ring on keyboard focus.',
    "A bar scrolled fully off screen (`enter-always`, or a small bar's `exit-until-collapsed`) is `inert`: Tab skips its controls and screen readers leave them out until it comes back.",
    'While keyboard focus is on one of its controls the bar stays on screen as the page scrolls, and focusing a partly hidden bar brings it back, so a focused control is never hidden (WCAG 2.4.11).',
  ],
  touchTarget: [
    'The bar adds no targets of its own. Its icon buttons are `standard` {@link IconButton}s, which keep their 48 × 48px touch target.',
  ],
  motion: [
    "The bar collapses with the page's scroll, following the scroll position rather than animating. Under reduced motion an `enter-always` bar stays on screen: a small bar stays put and a medium or large one only collapses to its top row, as with `exit-until-collapsed`. The colour change when content scrolls under it fades on the effects spring.",
  ],
  consumer: [
    "Wrap `title` in a heading (`<h1>`) when it names the page, and keep it the same as the page's name.",
    'Give every icon-only control in `navigationIcon` and `actions` an `aria-label` that says what it does ("View on map").',
    'With `scrolledColor="transparent"`, give the icon buttons a container fill (`variant="tonal"`) so they stay legible over the content.',
  ],
};
