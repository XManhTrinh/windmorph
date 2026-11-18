import type { ComponentAccessibility } from './types';

export const chartFrame: ComponentAccessibility = {
  keyboard: [
    {
      keys: ['Enter', 'Space'],
      action: 'Switches between the chart and its table.',
      where: 'The table switch',
    },
    { keys: ['Enter', 'Space'], action: 'Calls `onRetry`.', where: 'Try again, after an error' },
  ],
  keyboardNotes: [
    'The chart inside keeps its own keys: a line, bar or segmented chart is one stop, a slider over its places.',
    "When the table view's rows are cut off, they are a tab stop of their own that the arrow and page keys scroll, as a plain `DataTable`'s are.",
  ],
  screenReader: {
    role: 'The core `Card` (a plain container) with a heading, the chart, and in the table view a `table`.',
    name: 'The title is a heading (`h3` by default, `headingLevel`). It names every chart inside through `aria-labelledby`, unless a chart has a name of its own, and names the table view too.',
    states:
      'The table switch is a toggle button named `labels.showTable` ("Show as a table"), the same name in both views, with `aria-pressed` saying whether the table shows. While `pending`, the chart area is `aria-busy`.',
    notes: [
      'While `loading`, a status says `labels.loading` ("Loading"); the status goes into the page a moment before its words, so it is announced.',
      "The `error` message, and `empty` words given as text, are announced politely as they take the chart's place, through a status that is in the page from the start. An `EmptyState` passed as `empty` announces itself with its own `announce`.",
      'The description is a paragraph after the title, read in page order.',
      'While the table shows, the chart stays in the page, hidden from everyone.',
    ],
  },
  focus: [
    'The header comes first in Tab order: your actions, then the table switch. The switch keeps focus as the view changes.',
    'While the table shows, the chart is hidden and leaves the Tab order; it comes back where it was.',
    "Focus never drops to the page. When what has it goes (the table switch as a state replaces the chart, Try again as `onRetry` loads again, a focused chart as the loading placeholder takes its place), the chart area holds it, then hands it to Try again if loading fails again; a chart that comes back doesn't take it from there. While `pending`, Try again shows the core button's progress indicator and keeps focus.",
  ],
  touchTarget: [
    "The table switch is the core's standard icon button, with a 48px target; Try again is the core's tonal button, with its 48px target.",
    'The chart inside has its own targets; see its page.',
  ],
  motion: [
    'Switching between the chart and the table fades the new view in on an effects spring (`--wm-chart-frame-view-duration`), under reduced motion too: a fade is not movement.',
    'While `pending`, the marks dim and come back on an effects spring, under reduced motion too: a fade is not movement.',
    'The loading placeholder is a `Skeleton`, which holds still under reduced motion.',
    "Going back from the table never replays the chart's entrance: it stayed in the page.",
  ],
  consumer: [
    'Give every frame a `title` that says what the chart shows; it names the chart, so the chart needs no `aria-label`.',
    "Set `headingLevel` to fit the page's outline.",
    'Pass `empty` when there is nothing to draw, and write `error` as what failed and what to do: the frame announces it, so it needs no announcement of your own.',
    'For lists and meters, which give no table, the printed figures are the text alternative; pass `table` only for figures they leave out.',
    'Translate `labels.showTable`, `labels.loading` and `labels.retry`, or set them once for the app with a {@link LabelsProvider} (its `ChartFrame` words).',
  ],
};
