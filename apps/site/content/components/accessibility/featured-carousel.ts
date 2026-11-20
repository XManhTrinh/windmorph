import type { ComponentAccessibility } from './types';

export const featuredCarousel: ComponentAccessibility = {
  keyboard: [
    {
      keys: ['Tab', 'Shift + Tab'],
      action:
        "Moves through the Pause control (with `autoAdvance`), the current slide's links and buttons, then Previous and Next.",
    },
    {
      keys: ['Arrow Left', 'Arrow Right'],
      action:
        'Moves to the previous or next slide, going round, while the pointer is over the carousel or focus is in it; swapped in right to left.',
    },
    {
      keys: ['Enter', 'Space'],
      action: 'Presses Previous, Next or the Pause control; focus stays on it.',
    },
  ],
  keyboardNotes: [
    'Left and Right are left alone on anything with arrow keys of its own (a field, a slider, tabs, a radio group, a menu, a list box) and with a modifier key held.',
    'The keys never reach a carousel scrolled out of sight: the page listens only while the pointer is over it.',
    'Without a mouse, Previous and Next are a visually hidden pair beside the dots that shows when one of them has keyboard focus.',
  ],
  screenReader: {
    role: 'A `region` with `aria-roledescription="carousel"`; each slide a `group` with `aria-roledescription="slide"`. Previous, Next and the Pause control are buttons.',
    name: 'The carousel takes `aria-label` or `aria-labelledby` (one is required). Each slide is named by its place ("2 of 4", `labels.position`). The Pause control\'s name changes with what it does ("Pause the slideshow", "Play the slideshow"), so it has no `aria-pressed`.',
    states:
      'Only the current slide is reachable: the others are `inert`. After a move by hand a polite status says the slide\'s `textValue` and place ("City after dark, 2 of 4"); a move it makes by itself, or one your `index` makes, says nothing.',
    notes: [
      'The dots are decoration (`aria-hidden`); past `maxDots` the count ("3 of 30") stands in for them.',
      'The announcement comes from a live region mounted with the carousel, so its first message is read.',
    ],
  },
  focus: [
    'The Pause control comes first in the Tab order (the APG), though it is drawn under the slides.',
    "When the current slide changes with focus inside it, focus moves first to the arriving slide's container (focusable by script only, with an inset focus ring), so it never falls to the page.",
    'Keyboard focus coming into the carousel stops the slides moving by themselves; media in a slide plays on until the Pause control stops it.',
    'The side arrows show the shared two-tone ring over pictures, on keyboard focus only.',
  ],
  touchTarget: [
    'The side arrows are 48px; the Pause control and the hidden pair are 32px buttons with 48px targets. The dots are not targets.',
    'The whole band beside the current slide takes a press, more than the narrow strip of the neighbour that shows.',
    'Nothing needs a swipe (WCAG 2.5.7): one press always moves it.',
  ],
  motion: [
    "Moves use the browser's smooth scroll; under reduced motion they jump.",
    'The slide becoming current grows and brightens on the default spatial spring; under reduced motion at once.',
    'Under reduced motion it never moves by itself, media in a slide is not told it may play, and the Pause control is left out.',
    'The side arrows fade in and out on the default effects spring, kept under reduced motion.',
  ],
  consumer: [
    'Name the carousel (`aria-label`, or `aria-labelledby` a heading) and give each slide a `textValue` that names it in the announcement.',
    'Keep slide words clear of the side arrows with `wm-featured-carousel-content` (or `--wm-featured-carousel-control-inset`).',
    'In a slide that plays media, pass `media` and follow `useFeaturedCarouselSlide().mayMove`, so the Pause control stops it too (WCAG 2.2.2).',
    'Translate `labels` (`carousel`, `slide`, `position`, `previous`, `next`, `pause`, `play`, `announcement`, `count`), or set them once for the app with a `LabelsProvider`.',
    'In forced-colours mode the arrows keep a `CanvasText` boundary and the dots take system colours.',
  ],
};
