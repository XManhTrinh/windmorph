import type { ComponentAccessibility } from './types';

export const loadMore: ComponentAccessibility = {
  keyboard: [
    {
      keys: ['Tab'],
      action: 'Moves focus to Load more (or Retry after a failure), and on to the next element.',
    },
    {
      keys: ['Enter', 'Space'],
      action: 'Loads the next page, or retries the one that failed.',
    },
  ],
  keyboardNotes: [
    'Loading as the end comes near works for pointer and touch scrolling; the Load more button is the fallback for keyboard and screen-reader users, so it shows whenever there is more to load.',
  ],
  screenReader: {
    role: 'Load more and Retry are `button`s. The default loading indicator is a `progressbar`.',
    name: 'The buttons are named by `labels.loadMore` and `labels.retry`; the loading indicator by `labels.loading` ("Loading more").',
    states: 'None on the buttons.',
    notes: [
      "A failure's message (`labels.error`) is read politely through a visually hidden `status` region that is in the page from the start, so it is always announced; the visible copy beside Retry is hidden from screen readers so it is not read twice.",
      'Once all is loaded it shows nothing, or the `end` you pass.',
    ],
  },
  focus: [
    'Load more sits in the Tab order after the list, where the component is placed.',
    'Focus never drops to the top of the page. While focus is inside it (after a press on Load more or Retry, or on Load more as it starts loading by itself), it holds focus on its root while the page loads (or once all is loaded), then moves it to the next Load more or Retry. It moves focus with `preventScroll`, and tabbing to Load more brings it into view.',
    'The root shows the M3 focus indicator while it holds focus from the keyboard.',
    "Keyboard focus on the buttons shows M3's focus indicator: a 3px `secondary` outline 2px outside the button.",
  ],
  touchTarget: [
    'Load more and Retry are small (40px tall) {@link Button}s, each with an invisible 48 × 48px touch target.',
  ],
  motion: [
    'It has no motion of its own. The default {@link LoadingIndicator} only rotates under reduced motion, and the buttons follow {@link Button}: their press ripple appears at full size without growing.',
  ],
  consumer: [
    'Pass every word through `labels` (`loadMore`, `retry`, `error`, `loading`) so they come from your translations.',
    "A custom `loading` (a skeleton of one item, say) needs its own accessible text, or a busy state on the list, since the default indicator's name is gone.",
    'Focus stays on Load more for the next page; if your readers should go to the first new item instead, move focus there yourself once it has loaded.',
    'It opts out of scroll anchoring, so a new page goes in below what is on screen without moving the page; avoid turning `overflow-anchor` back on around it.',
    'Set `status` to `done` when there is nothing more, so the button goes.',
  ],
};
