import type { ComponentAccessibility } from './types';

export const emojiPicker: ComponentAccessibility = {
  keyboard: [
    {
      keys: ['Enter', 'Space'],
      action:
        'Opens the picker; while it is docked below the field (on a phone), closes it and puts the caret back in the text; docked above the field, closes it.',
      where: 'On the trigger',
    },
    {
      keys: ['Tab', 'Shift + Tab'],
      action:
        'Moves between the search box, the category tabs, the grid (one stop) and the skin-tone button.',
      where: 'In the picker',
    },
    {
      keys: ['Arrow Down'],
      action: 'Moves from the search box to the first emoji.',
      where: 'In the search box',
    },
    {
      keys: ['Escape'],
      action:
        'Clears the search box when it holds text; otherwise closes the picker and returns focus to the trigger.',
      where: 'In the picker',
    },
    {
      keys: ['Escape'],
      action:
        'Closes the picker’s popover open beside the field, before the field’s own Escape.',
      where: 'In the message field’s text',
    },
    {
      keys: ['Arrow Left', 'Arrow Right'],
      action:
        'Moves between category tabs; Enter or Space on the selected tab scrolls the grid back to its start.',
      where: 'On the tabs',
    },
    {
      keys: ['Arrow Left', 'Arrow Right', 'Arrow Up', 'Arrow Down'],
      action: 'Moves by emoji and by row, across categories.',
      where: 'In the grid',
    },
    {
      keys: ['Home', 'End'],
      action: 'Moves to the first or last emoji of the row.',
      where: 'In the grid',
    },
    {
      keys: ['Ctrl + Home', 'Ctrl + End'],
      action: 'Moves to the first or last emoji.',
      where: 'In the grid',
    },
    {
      keys: ['Page Up', 'Page Down'],
      action: 'Moves by a screenful of rows.',
      where: 'In the grid',
    },
    {
      keys: ['Enter', 'Space'],
      action: 'Inserts the emoji (in the chosen skin tone) and keeps the picker open for more.',
      where: 'In the grid',
    },
  ],
  keyboardNotes: [
    'Arrow keys in the grid and on the tabs follow the reading direction, so they mirror right to left; emoji themselves are not mirrored.',
    'The grid scrolls only as far as the focused emoji needs, never the page, and its number of columns follows the panel’s width, so the keys and the layout always agree.',
  ],
  screenReader: {
    role: 'The trigger is a `button`. The panel is a `group` holding a search box, a `tablist` of categories and one `grid`, with a `rowgroup` of `gridcell` rows per category. In a popover or sheet it sits in a `dialog`; the popover beside a message field is a non-modal one.',
    name: 'The trigger, its dialog and the panel are named by `labels.title` ("Emoji"); the trigger docked below the field by `labels.keyboard` ("Show keyboard") and docked above it by `labels.hide` ("Hide emoji"). Each category’s rows are named by its heading, and each emoji by its name in the data’s language, with its tone ("waving hand: medium skin tone").',
    states:
      'The trigger is `aria-expanded` while the picker is open, and while docked it `aria-controls` the panel. The grid is named "Search results" while searching and is `aria-busy` while the emoji load; the selected category tab is `aria-selected`; the skin-tone button names the tone chosen ("Skin tone, Medium").',
    notes: [
      'One polite live region, mounted before its content, announces the result count after a pause in typing, the loading and the load error, and the category focus moves into, since a row group’s name isn’t read as focus enters it.',
      'The preview of the focused emoji and the category headings are hidden from assistive tech: each cell’s own name is what’s read.',
      'A custom emoji’s image is `alt=""`; its cell carries its `label`.',
    ],
  },
  focus: [
    'With a fine pointer the trigger opens with focus in the search box; with a coarse one (a phone, a tablet) on the panel itself, so an on-screen keyboard doesn’t cover it. `initialFocus` chooses on a panel of your own (`none` by default).',
    'Inside a message field, `focusOnSelect` (`auto` by default) puts a mouse or pen pick back in the text, the caret after the emoji, keeps a keyboard pick on the emoji picked and leaves a touch where it was; elsewhere, and in the sheet, focus stays in the picker between picks. It goes back to the trigger with `preventScroll` when the picker closes; the keyboard button of the panel docked below the field puts it back in the text instead.',
    'Focus is never dropped: an emoji that disappears with a search hands focus to the search box, and Try again holds it on the panel until the data is in.',
    'While the sheet is open, the message field behind it is inert, yet picks still go in at its kept caret. The popover beside a field is non-modal and the docked panel leaves the page as it is: the field stays usable, and the popover follows its trigger in Tab order. A popover away from a field is modal.',
    'The emoji, the tabs and the panel show the M3 focus indicator on `:focus-visible`; in forced colours the focus and hover rings are `Highlight` outlines.',
  ],
  touchTarget: [
    'Each emoji is a 48 × 48px cell, as is the trigger’s icon button.',
    'The ten category tabs share the panel’s width: about 40px each in the 408px panel and 33px on a 360px phone, above WCAG 2.5.8’s 24px but below M3’s 48px, which would need 480px.',
  ],
  motion: [
    'Under reduced motion a chosen category scrolls into place at once instead of smoothly, and the popover and sheet keep only their fades.',
    'An `animatedSrc` custom emoji plays only while hovered or focused and in the preview, and never under reduced motion, so the grid stays still (WCAG 2.2.2).',
  ],
  consumer: [
    'Install `emojibase-data` and `emojibase` beside Pro, and pass a `locale` with every `loadData`, so two languages never share a cache.',
    'Translate the picker’s words with `labels`, or once for the app with a `LabelsProvider` under `EmojiPicker`, and load the emoji data in the same language, so names, search and words agree.',
    'Give each custom emoji a `label` that says what it shows: it is the cell’s name, the preview’s text and what search matches.',
    'Where you show a custom emoji’s text (`:id:`), draw its image with the `label` as its text alternative.',
    'An app with accounts passes a `storageKey` per account (or a controlled `recent`), since everyone using the browser shares the default key.',
  ],
};
