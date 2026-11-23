import type { ComponentAccessibility } from './types';

export const videoPlayerSettings: ComponentAccessibility = {
  keyboard: [
    {
      keys: ['Enter', 'Space'],
      action: 'On the Settings button: opens or closes the panel.',
      where: 'The button',
    },
    {
      keys: ['Arrow Down', 'Arrow Up'],
      action: 'Moves to the next or previous row that shows, going round.',
      where: 'A list of rows',
    },
    { keys: ['Home', 'End'], action: 'Moves to the first or last row.', where: 'A list of rows' },
    {
      keys: ['A letter'],
      action: 'Moves to the next row whose name starts with it.',
      where: 'A list of rows',
    },
    {
      keys: ['Enter', 'Space'],
      action: 'Acts, switches, opens its page, or chooses.',
      where: 'A row',
    },
    {
      keys: ['Arrow Right'],
      action: 'Opens the page of a row that has one (Arrow Left in right to left).',
      where: 'A row with a page',
    },
    {
      keys: ['Arrow Left'],
      action: 'Goes back to the first page (Arrow Right in right to left).',
      where: 'A page',
    },
    {
      keys: ['Escape'],
      action: 'Goes back one page; on the first page, closes the panel.',
    },
    {
      keys: ['Tab', 'Shift + Tab'],
      action:
        "Moves through the page's controls: the header, then on the speed page Slower, the slider, Faster and the presets. Past the last, the panel closes.",
    },
    {
      keys: ['Arrow Left', 'Arrow Right', 'Page Up', 'Page Down', 'Home', 'End'],
      action:
        'Slower or faster by 0.05, by 0.25 with Page Up and Page Down, to the slowest or fastest with Home and End.',
      where: 'The speed slider',
    },
    {
      keys: ['Arrow Left', 'Arrow Right'],
      action: 'Moves between the presets, as a group of one choice.',
      where: 'The presets',
    },
  ],
  keyboardNotes: [
    "Keys pressed inside the panel are its own: none reach the player (K, M, F, C, the digits, Space, the arrows), in full screen too, and an arrow nothing uses doesn't scroll the page.",
    'A row hidden by CSS (Autoplay and Rotate where the bar shows them) is skipped by the keys.',
  ],
  screenReader: {
    role: 'The panel is a non-modal `dialog`. The first page is a `menu`: an action or a row with a page is a `menuitem` (with `aria-haspopup`), a switch row a `menuitemcheckbox`. A choice page is a `menu` of `menuitemradio`s; the speed page a `group` with a `slider` and a `radiogroup` of presets.',
    name: 'The panel is named as its button ("Settings", `labels.settings`). A row\'s name is written out: its label, a badge\'s words after a space, then a comma and its value ("1080p HD", "Quality, Auto (720p)"). Its `description` describes it (`aria-describedby`) rather than joining the name. The header is one button, "Back, Quality" (`labels.back`), holding the title it shows; the page stays named by that title.',
    states:
      'A switch row reports `aria-checked`; the drawn switch is hidden. The chosen option of a choice reports `aria-checked`; its tick is decoration. The speed slider reads its value in words ("Normal", "1.5×"), and Slower and Faster say the new speed in a polite region mounted first. A preset\'s caption describes it.',
    notes: [
      "A page change isn't announced: focus moving into the page says its name and the focused row.",
      'A text badge is read as written ("1080p HD"); a badge that isn\'t text (an icon) is read as its `badgeLabel`. A mark before a preset takes a name from you if it means something.',
    ],
  },
  focus: [
    'Opening moves focus to the first row that shows (with `children` as a function, the first row it places); a new page to its first row, its chosen row, or the slider on the speed page, all without scrolling.',
    'Going back focuses the row the page came from. Closing by Escape, the button or a choice focuses the button; a press outside returns focus to the button only if it was inside. Focus never lands on the page.',
    'Rows and buttons show the two-tone on-media focus ring on keyboard focus only, never for a focus a script moved.',
  ],
  touchTarget: [
    'Rows are 48px tall. Slower and Faster are 32px buttons with 48px targets.',
    "In the bottom sheet (under 600px of window) the speed page takes M3's touch sizes: the core slider, 40px tonal buttons and 40px presets.",
  ],
  motion: [
    'The panel fades in and out in 50ms; a choice closes it at once.',
    'Pages slide a full width in 150ms while the height follows on the same timing, mirrored in right to left.',
    'Under reduced motion pages and height change at once; the fade stays.',
  ],
  consumer: [
    'Alone, put your button first in `VideoPlayerSettingsTrigger`, with a name ("Settings"), and name a positioned `container` for the panel.',
    "Give a badge that isn't text a `badgeLabel` (on a row or an option), so its meaning is read with the name.",
    "Give each row a short `label`, and a `value` that says what is chosen; give a row whose label isn't plain text a `textValue` for the letter search.",
    'Keep the default fill and quieter text unless your own keep 4.5:1 over a white frame.',
    "Translate `labels` (`settings`, `back`, and the speed page's `speed`, `normal`, `slower`, `faster`, `presets`, `speedValue`, `speedExact`), or set them once for the app with a `LabelsProvider`.",
    'In forced-colours mode the panel is `Canvas` with a `CanvasText` edge, and the chosen preset and tick are `Highlight`.',
  ],
};
