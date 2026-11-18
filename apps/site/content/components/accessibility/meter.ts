import type { ComponentAccessibility } from './types';

export const meter: ComponentAccessibility = {
  keyboard: {
    none: 'A meter reports a level and takes no input, so it has no keys.',
  },
  screenReader: {
    role: '`meter`, from React Aria. A `MeterList` is a `list` whose every row holds one.',
    name: "A meter's `label` names it (`aria-labelledby`), as each row's `label` does in a list. A `MeterList` is named by `aria-label` or `aria-labelledby`, or by the title of the Chart frame it sits in.",
    states:
      '`aria-valuenow`, `aria-valuemin` and `aria-valuemax`, with the words in `aria-valuetext` from `labels.valueText`: "75.6 GB of 100 GB", then the state\'s words past `warningAt` or `max` ("18 of 20, Close to the limit"). Past the limit `aria-valuenow` stays at `max` and the words give the real amount ("22 of 20, Over the limit"). An amount or a limit that isn\'t a number still gives numbers within the range, and the words say "No value".',
    notes: [
      "The figure, the track and the state's mark and words beside it are hidden from assistive tech (`aria-hidden`), since the value text says them. The `note` is read as it is, after the meter.",
      "It isn't a live region: a new amount is read when someone reaches the meter, not announced. Announce a change that matters in a live region of your own.",
      "A meter's `aria-describedby`, `aria-details` and description attributes go on the `meter`; a list's go on the list.",
    ],
  },
  focus: { none: 'A meter is not focusable, and a `MeterList` adds no focus stops.' },
  touchTarget: { none: 'A meter takes no presses, so it has no touch target.' },
  motion: [
    "The fill grows from the start the first time the meter comes into view, as its number counts up from `min`; a new amount moves both, on the theme's default spatial spring (`--wm-meter-fill-duration`, `--wm-meter-fill-easing`). Under reduced motion both change at once.",
    "A meter on screen as the page loads shows its final picture from the server's HTML; nothing replays as the page hydrates.",
  ],
  consumer: [
    'Give every meter a `label` that says what is measured ("Storage", "Seats"), and name each `MeterList`; a development build warns about a list with no name.',
    'Write the amount with its unit in `formatValue`, so the value text says it ("75.6 GB of 100 GB"), and put what is left, or what to do, in `note`.',
    'Translate `labels` (`of`, `near`, `over`, `valueText` and `noValue`), or set them once for the app with a {@link LabelsProvider}.',
    "Use a meter for a level, not for the progress of a task: assistive tech reads a `meter` as a measurement, and a Progress indicator's `progressbar` as work under way.",
    "In forced-colours mode the track keeps a `CanvasText` border, the fill is `CanvasText` and the notch at `warningAt` stays a gap, while the state's mark and words carry the warning; keep `classNames` overrides from removing them.",
  ],
};
