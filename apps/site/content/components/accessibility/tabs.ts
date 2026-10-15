import type { ComponentAccessibility } from './types';

export const tabs: ComponentAccessibility = {
  keyboard: [
    {
      keys: ['Tab'],
      action: 'Moves focus into the row, to the selected tab, and on into the panel.',
    },
    {
      keys: ['Arrow Left', 'Arrow Right'],
      action:
        'Moves focus to the previous or next tab without selecting it. With `keyboardActivation="automatic"` it selects the tab too.',
    },
    { keys: ['Home', 'End'], action: 'Moves focus to the first or last tab.' },
    { keys: ['Enter', 'Space'], action: 'Selects the focused tab and shows its panel.' },
  ],
  keyboardNotes: [
    'The arrow keys wrap from the last tab to the first, skip disabled tabs (`disabledKeys`), and are mirrored right to left, following the direction the row is laid out in.',
  ],
  screenReader: {
    role: "A `tablist` of `tab`s, with the selected tab's content in a `tabpanel`.",
    name: 'The row is named by `aria-label` or `aria-labelledby`. Each tab is named by its `title`, or by its own `aria-label` when it is icon-only.',
    states:
      'Selected (`aria-selected`) and disabled (`aria-disabled`). Each tab points at the panel with `aria-controls`, and the panel is labelled by its tab.',
    notes: [
      'Icons and the active indicator are hidden from assistive tech (`aria-hidden`).',
      'A `badge` is left out of the tab\'s name and describes it instead (`aria-describedby`), so "Inbox" is read with "12" as its description. A small dot badge reads "New notification", or its `label`.',
      'A row with no panels (tabs that only navigate) renders no panel and leaves out `aria-controls`.',
    ],
  },
  focus: [
    'The row takes one Tab stop: focus lands on the selected tab, and the arrow keys move it between tabs (a roving tab index).',
    "Keyboard focus shows M3's focus indicator, a 3px `secondary` outline drawn inside the tab, so neighbouring tabs and a scrolling row never clip it. Pointer presses show no ring.",
    'The panel takes focus itself, with the same inset ring, only when it holds nothing focusable.',
    'In a scrollable row the selected tab scrolls to the centre.',
  ],
  touchTarget: [
    'Tabs with text, icons before labels, or icons only are at least 48px tall; tabs with icons above labels are at least 64px tall.',
    "Fixed tabs share the row's width; scrollable tabs are at least 90px wide.",
    "With `density` (or the theme's), tabs lose 4px a step, to 36px (52px with icons above) at -3. They sit side by side in one row, so like dense menu items they keep full-height targets of their own, above WCAG 2.5.8's 24px minimum, rather than reaching outside the row. M3 asks not to apply density by default: offer it as the reader's choice.",
  ],
  motion: [
    'Under reduced motion the indicator jumps to the selected tab instead of sliding, and a scrollable row scrolls to it at once. Colours still fade, and the press ripple appears at full size without growing.',
  ],
  consumer: [
    'Name the row with `aria-label` or `aria-labelledby`.',
    'Give an icon-only tab an `aria-label` that says what it holds ("Video" rather than "Camera").',
    'Keep labels short and visible; a scrollable row lets them keep their natural width instead of truncating.',
    'Leave `swipeable` off when the panel holds its own swipeable content, such as a map or a carousel; the keys and presses still change tab.',
  ],
};
