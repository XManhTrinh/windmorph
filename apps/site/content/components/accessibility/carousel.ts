import type { ComponentAccessibility } from './types';

export const carousel: ComponentAccessibility = {
  keyboard: [
    {
      keys: ['Tab', 'Shift + Tab'],
      action:
        'Moves focus to the next or previous item, scrolling it into place. Every item is a Tab stop; the container itself never takes focus.',
    },
    {
      keys: ['Arrow Right', 'Arrow Left'],
      action:
        'Moves focus to the next or previous item, scrolling it into place. In a vertical carousel, Arrow Down and Arrow Up do this.',
    },
    { keys: ['Home', 'End'], action: 'Moves focus to the first or last item.' },
    {
      keys: ['Arrow Down', 'Arrow Up'],
      action:
        'Leaves the carousel for the next or previous control on the page, such as a Show all button. In a vertical carousel, Arrow Right and Arrow Left do this.',
    },
    {
      keys: ['Enter', 'Space'],
      action: 'Activates the focused item, as a press does.',
      where: 'With `onAction`',
    },
  ],
  keyboardNotes: [
    'In a right-to-left layout Arrow Left and Arrow Right swap, so the arrow always points the way focus moves.',
    'Focusing an item with the keyboard scrolls it into view: a multi-browse or hero carousel scrolls it to its snap position. A press, a click or a tap focuses the item without moving the carousel, on an actionable carousel (`onAction`) too.',
  ],
  screenReader: {
    role: 'A `region` described as a "carousel" (`aria-roledescription`). Each item is a `group` described as a "slide".',
    name: 'The carousel takes `aria-label`, or `aria-labelledby` pointing at a visible title, which its types require. Each item is named by its position, "1 of 5", with numbers formatted for the locale.',
    states:
      'Disabled (`aria-disabled`) for an item in `disabledIndexes` when the carousel has `onAction`.',
    notes: [
      '`labels.slide` builds each item\'s name, and `labels.carousel` and `labels.item` translate the "carousel" and "slide" descriptions.',
      'The state layer over an actionable item is decorative and hidden from assistive tech (`aria-hidden`).',
    ],
  },
  focus: [
    "Tab lands on the first item. Keyboard focus shows M3's focus indicator: a 3px `secondary` outline 2px outside the item, or drawn inside it in a full-screen carousel, whose items fill the window. Pointer presses show no ring.",
    'Items in `disabledIndexes` can still take focus, but a press, Enter or Space does nothing.',
  ],
  touchTarget: [
    'Touch, trackpads and mouse drags scroll the carousel, also when the drag starts on an actionable item; snapping pauses while dragging and resumes on release, and a drag never activates an item.',
    "Large and medium items are well over 48px. The small items of a multi-browse or hero carousel are 40 to 56px wide (`minSmallItemSize`, `maxSmallItemSize`); one narrower than 48px still takes 48px of presses, its press area grown into the spacing beside it (half of it next to another small item, and toward its neighbour where it meets the carousel's edge), so press areas never overlap.",
    "Only an item's visible part (and that press area) takes presses, so a press in the spacing between two items reaches neither.",
  ],
  motion: [
    "Under reduced motion items don't change size as they scroll: every item keeps the large size, unmasked, and a hero carousel shows part of the next item. Keyboard scrolling jumps instead of scrolling smoothly, and the pressed item's corner morph snaps.",
  ],
  consumer: [
    'Name every carousel with `aria-label`, or `aria-labelledby` pointing at a visible title.',
    'Give each image an `alt` text that says what it shows, since each item is announced only by its position.',
    'Under reduced motion, let a carousel reach the edges of the window so the large items are not clipped.',
    'Add a Show all button (or an arrow icon button beside the header) after the carousel, so every item can be reached without scrolling through it.',
    'Pass `labels` to translate the slide names and descriptions.',
  ],
};
