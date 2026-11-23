import type { ComponentAccessibility } from './types';

export const durationTag: ComponentAccessibility = {
  keyboard: {
    none: 'A duration tag shows a length and takes no input, so it has no keys.',
  },
  screenReader: {
    role: 'No role of its own: plain text, part of whatever holds it (a link around the picture, say).',
    name: 'It has no name; its words become part of the name of the link or button around it ("City after dark, Length 4 minutes, 12 seconds").',
    states:
      'One visually hidden text in words, in the page\'s language: "Length 7 seconds", "Length 4 minutes, 12 seconds", "Length 1 hour, 2 minutes, 3 seconds". It is one text, so a link\'s name keeps the space before it. `label` replaces it.',
    notes: [
      'The clock ("4:12") is hidden from assistive tech (`aria-hidden`), so the length is read once, in words.',
      "Inside a link, its visible clock isn't in the link's name letter for letter; the words say the same length, which axe's `label-content-name-mismatch` check accepts.",
    ],
  },
  focus: { none: 'Nothing in a duration tag takes focus: no `tabindex`, no tooltip, no `title`.' },
  touchTarget: {
    none: 'A duration tag has nothing to press; a press on it is a press on the card around it.',
  },
  motion: { none: 'A duration tag has no motion.' },
  consumer: [
    'Put the tag last in its `MediaFrame` (or your own one-cell grid), so nothing laid over the picture covers it.',
    'Mark the picture beside it as decorative (`alt=""`) when the link\'s words already name the video.',
    'Translate `labels.length` ("Length"), or set it once for the app with a `LabelsProvider`; the length itself is written in words by `Intl` in the page\'s locale.',
    'Keep the default colours unless your own pair keeps 4.5:1 over a white picture: the tag must read over any frame of the video.',
    'In forced-colours mode the tag is drawn on `Canvas` with a `CanvasText` border and text.',
  ],
};
