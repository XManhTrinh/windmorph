import type { ComponentAccessibility } from './types';

export const statTile: ComponentAccessibility = {
  keyboard: {
    none: 'A stat tile and a sparkline show figures and take no input, so they have no keys.',
  },
  screenReader: {
    role: 'A `group`. A `Sparkline` standing on its own with a name is an `img`; without one it is hidden.',
    name: 'The tile\'s `label`, which it is labelled by (`aria-labelledby`). A sparkline on its own takes `aria-label` or `aria-labelledby`, saying what it shows and which way it goes ("Visits over twelve weeks, rising").',
    states:
      'The number is read once, as it settles: the counting figure is hidden and a copy of the final one is read. With `valueText`, that copy is its words for the settled value ("105,312" for a shown "105K", "8.2 minutes" for "8.2 min"), and the figure and unit on screen are hidden from screen readers. A change is read as one sentence, its visible text hidden from screen readers so it is heard once: the direction in words (`labels.up`, `labels.down`, `labels.flat`), your `value` and `context`, then good or bad news in words (`labels.good`, `labels.bad`; nothing for `neutral`), as in "Up 12% on last week, better". `labels.change(parts)` puts it together, so a language can order the parts its own way. A number that isn’t one reads `labels.noValue` ("No value").',
    notes: [
      "The change's arrow and the sparkline inside a tile are hidden from assistive tech (`aria-hidden`): the words say which way the number moved.",
      "It isn't a live region: a new value is read when someone reaches the tile, not announced. Announce a change that matters in a live region of your own.",
      '`aria-describedby` and `aria-details` go on the group.',
    ],
  },
  focus: { none: 'Nothing in a stat tile or a sparkline takes focus.' },
  touchTarget: { none: 'A stat tile has nothing to press, so it has no touch target.' },
  motion: [
    "The number counts up from 0 the first time the tile comes into view, and springs from the figure showing to each new value on the theme's spatial spring, never showing a figure past it. Under reduced motion it shows the new value at once.",
    "A sparkline's new values spring into their shape while it is on screen; off screen and under reduced motion they land at once.",
    "A tile on screen as the page loads shows its final picture from the server's HTML; nothing replays as the page hydrates.",
  ],
  consumer: [
    'Give each tile a `label` that says what the number is ("Orders", "Time on page"): it names the tile.',
    'When the figure is shortened ("105K") or its unit abbreviated ("h", "min"), pass `valueText` with the full value and the unit in words, so screen readers hear what is meant.',
    'Write `change.value` and `change.context` as words that read well after "Up" or "Down" ("12%", "on last week"), and set `change.tone` by what the change means for the reader: a rise in returns is `bad`.',
    'Translate `labels` (`up`, `down`, `flat`, `good`, `bad`, `separator`, the " · " shown before good or bad news, `change`, which orders the sentence, and `noValue`), or set them once for the app with a {@link LabelsProvider}.',
    'Name a sparkline that stands on its own, and leave the one inside a tile unnamed.',
    "In forced-colours mode the tile has no container by design: its label, number and words carry it. The tone's colour gives way to the system text colour; the change still says whether it is good news in words on screen (`labels.good`, `labels.bad`), as it does in every mode. A sparkline's line is drawn in `CanvasText`, and its end dot in `CanvasText` with a `Canvas` ring.",
  ],
};
