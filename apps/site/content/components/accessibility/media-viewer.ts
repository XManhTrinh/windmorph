import type { ComponentAccessibility } from './types';

export const mediaViewer: ComponentAccessibility = {
  keyboard: [
    {
      keys: ['Tab', 'Shift + Tab'],
      action:
        'Move between the controls: Close, Zoom out, Zoom in, your `actions`, Previous and Next, and an expandable caption. Focus stays in the viewer.',
    },
    {
      keys: ['Arrow Left', 'Arrow Right'],
      action: 'Show the previous or next photo. While zoomed, they pan the photo instead.',
    },
    {
      keys: ['Arrow Up', 'Arrow Down'],
      action: 'Pan the photo while zoomed. Unzoomed, they do nothing.',
    },
    { keys: ['Home', 'End'], action: 'Show the first or last photo.' },
    { keys: ['+', '-'], action: 'Zoom in or out (`=` and `_` work too).' },
    { keys: ['0'], action: 'Resets the zoom.' },
    { keys: ['Escape'], action: 'Closes the viewer.' },
    {
      keys: ['Enter', 'Space'],
      action: 'Press the focused control, or expand and collapse a cut caption.',
    },
  ],
  keyboardNotes: [
    'In right-to-left layouts Arrow Left and Arrow Right swap, so Arrow Left shows the next photo.',
    'Hold Shift while panning to move four times as far (48px a press, 192px with Shift).',
    "The viewer's keys are ignored when Alt, Ctrl or ⌘ is held, and inside text fields or content portalled from `actions`, such as an open menu.",
  ],
  screenReader: {
    role: "A modal `dialog`: the core's full-screen `Dialog`.",
    name: 'Its required `aria-label` or `aria-labelledby` ("Photos from Alex\'s post").',
    states:
      'A cut caption is a `button` with `aria-expanded`. Zoom buttons are disabled when they can go no further.',
    notes: [
      'The position ("Photo 2 of 7", `labels.position`) is a polite live region, read when the photo changes. A single photo has no position.',
      'The current photo is read by its `alt`. The preloaded photos on each side are hidden from assistive tech (`aria-hidden`, `inert`).',
      "With no caption, the alt text is also shown as the caption, hidden from screen readers (`aria-hidden`) since the photo is already named by it; if it's cut, its expand button is named by `labels.description`.",
      "Every control's name is also its tooltip, the core icon button's own, so it isn't read twice.",
      "A photo that can't be loaded shows `labels.error` in its place.",
      'The page behind is hidden from assistive tech while the viewer is open.',
    ],
  },
  focus: [
    'When it opens, focus moves to its first control (Close), as in any core dialog, and Tab and Shift + Tab stay inside it until it closes. When it closes, focus returns to the element that had it, usually the thumbnail that opened it.',
    'Previous and Next disappear at the first and last photo. Pressing one to get there moves focus to the other; otherwise focus falls back to the viewer, so the keys keep working.',
    'When the focused zoom button becomes disabled, focus moves to the other zoom button after a press, or to the viewer after a key.',
    "Every control shows M3's focus indicator on keyboard focus.",
  ],
  touchTarget: [
    'Close, the zoom buttons and icon buttons in `actions` are small icon buttons (40px) with an invisible 48 × 48px touch target, kept at density 0 whatever the theme density. Previous and Next are 56px tonal icon buttons.',
    'Previous and Next show on every window size, so moving between photos never needs a swipe (WCAG 2.5.7).',
    'On touch a swipe down closes the viewer, which the Close button also does. A double-tap or double-click, a pinch, or Ctrl or ⌘ with the wheel zooms, as the zoom buttons and keys do.',
  ],
  motion: [
    "It opens and closes with the core full-screen dialog's motion: it slides up and fades in, or, given an `origin`, grows out of that thumbnail and shrinks back into it (the M3 container transform). Under reduced motion it only fades.",
    'Photos slide to the next one and zoom eases into place; under reduced motion both snap. While a finger or pointer is down they follow it without easing.',
  ],
  consumer: [
    'Name the viewer with `aria-label` or `aria-labelledby`, and give every photo an `alt` that says what it shows.',
    'Pass `labels` from your translations: every word it shows or announces comes from there, including the position.',
    'Give every control in `actions` a name; an icon button needs an `aria-label`.',
    'Open it from a real control, such as a {@link MediaGrid} tile, so focus has somewhere to return to.',
    'Name the expand button of an alt-text caption with `labels.description` in your language.',
  ],
};
