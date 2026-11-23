import type { ComponentAccessibility } from './types';

export const mediaTimeSlider: ComponentAccessibility = {
  keyboard: [
    {
      keys: ['Arrow Right', 'Arrow Up'],
      action: 'Moves forward by `step` seconds (5 by default).',
    },
    { keys: ['Arrow Left', 'Arrow Down'], action: 'Moves back by `step` seconds.' },
    { keys: ['Page Up', 'Page Down'], action: 'Moves forward or back a tenth of the length.' },
    { keys: ['Home', 'End'], action: 'Goes to the start or the end.' },
  ],
  keyboardNotes: [
    'On a right-to-left page too, Arrow Right moves forward and Arrow Left back: the bar runs left to right in every language, as media progress does.',
    'Each key calls `onChangeEnd` (and `onChange` when it moves the position), so a player seeks once per key press.',
  ],
  screenReader: {
    role: 'A `slider` (a native range input) inside a `group`.',
    name: 'Named by `aria-label` or `aria-labelledby`, which its types require ("Position", or the title of what plays).',
    states:
      'Its value in words, `aria-valuetext`: "1 minute, 23 seconds of 10 minutes" in the page’s locale, its unit words and its digits (Arabic-Indic in `ar-EG`, though the bar runs left to right), from `labels.position`; `valueText` writes your own. While the length is unknown (`NaN`, `0`, `Infinity`) it is `aria-disabled` and reads `labels.unknownLength` ("Length unknown"); only `disabled` disables the input.',
    notes: [
      'The time bubble, the bar and its loaded parts are hidden from assistive tech (`aria-hidden`); the value says the same.',
      'The hover fill is part of that hidden bar, a preview under a mouse, a trackpad or a pen, never a touch: the stretch from the played part to the pointer fills, where a press would land (`--wm-media-time-slider-hover-color`, `primary` at 38% by default). Forced colours hide it.',
      "A screen reader's step (one step of the native input, such as a swipe up or down on a phone's screen reader) moves `step` seconds and seeks, as a key does.",
      "While it has focus, its value and words stay where the person last put it during playback, so a screen reader doesn't announce the time every second; each move key (one that changes nothing included), step or drag refreshes them, the length's words stay still as a stream grows, and they follow playback again once focus leaves. When the next media's length is unknown, the reading starts again from its own position.",
    ],
  },
  focus: [
    'One tab stop, the handle. Keyboard focus grows the bar, shows the handle with the M3 focus ring round it, and shows the bubble with its time.',
    'With no length it leaves the Tab order; focus already on it stays there as new media loads.',
  ],
  touchTarget: [
    'The whole bar is a 48px tall target, however thin it draws; a press anywhere on it seeks there.',
  ],
  motion: [
    'The bar grows and the handle grows from its resting size (none by default) on the fast spatial spring; under reduced motion both change at once.',
    'The bubble fades in and out, under reduced motion too: a fade is not movement.',
  ],
  consumer: [
    'Name it with `aria-label` ("Position", "Seek") or `aria-labelledby` the title of what plays.',
    'Translate `labels.position`, or set it once for the app with a {@link LabelsProvider}; the unit words come from the locale.',
    'Seek in `onChangeEnd`, and keep updating `value` from the media as it plays.',
    "Pass the media element's `duration` as it is: its `NaN` while the next media loads lets go of what was held for the last one. Keep the slider mounted rather than giving it a new `key`, which would drop focus on it to the page.",
    'Translate `labels.unknownLength` too.',
    'Leave about 40px above the bar for the bubble, or let it overflow.',
  ],
};
