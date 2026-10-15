import type { ComponentAccessibility } from './types';

export const richMessageField: ComponentAccessibility = {
  keyboard: [
    {
      keys: ['Enter'],
      action:
        'Sends, with `submitOn="enter"` (the default) on a computer. In a list it starts the next item (an empty one ends the list), in a code block a new line, and on a touch screen a new paragraph.',
      where: 'In the text',
    },
    {
      keys: ['Shift + Enter'],
      action: 'Starts a new paragraph, or a new line in a list or code block.',
      where: 'In the text',
    },
    {
      keys: ['Ctrl + Enter'],
      action: 'Sends, unless `submitOn="none"`.',
      where: 'In the text',
    },
    {
      keys: ['Ctrl + B', 'Ctrl + I'],
      action: 'Toggles bold or italic at the caret or on the selection.',
      where: 'In the text',
    },
    {
      keys: ['Ctrl + Shift + X', 'Ctrl + Shift + C'],
      action: 'Toggles strikethrough or inline code.',
      where: 'In the text',
    },
    {
      keys: ['Escape'],
      action: 'Closes the mention list when it is open; otherwise calls `onEscape` when given.',
      where: 'In the text',
    },
    {
      keys: ['Arrow Up', 'Arrow Down'],
      action: 'Moves the active person up or down the list, wrapping.',
      where: 'With the mention list open',
    },
    {
      keys: ['Enter', 'Tab'],
      action: 'Puts the active person in as a mention.',
      where: 'With the mention list open',
    },
    {
      keys: ['Arrow Left', 'Arrow Right'],
      action:
        'Moves between buttons. The tools wrap at the ends and take Home and End; the formatting buttons stop at the ends.',
      where: 'In the tools and the formatting toolbar',
    },
    {
      keys: ['Enter', 'Space'],
      action:
        'Toggles a format, or shows and hides the formatting toolbar (the Aa tool), keeping the caret in the text. Link opens a dialog asking for the address; on a link it removes it.',
      where: 'On a formatting button',
    },
  ],
  keyboardNotes: [
    'On a Mac, ⌘ takes the place of Ctrl.',
    "Typing the marker format (`*bold*`, `- `, ```` ``` ````) formats as you go, so every format is reachable without the toolbar. Enter that confirms an input method's candidate never sends.",
    'Arrow keys in the toolbars are mirrored in right-to-left text.',
  ],
  screenReader: {
    role: 'The editor is a `textbox` with `aria-multiline`. The tools and the formatting buttons are two `toolbar`s of icon buttons; the formatting buttons and the Aa tool are toggle buttons. The mention list is a `listbox` of `option`s. Link asks in a `dialog`.',
    name: 'The editor is named by `label`, `aria-label` or `aria-labelledby` (required), and described by the description, error and counter as {@link MessageField} is. The formatting toolbar and the Aa tool are named `labels.formatting` ("Formatting"), each format by its label ("Bold", "Bulleted list"), and the mention list `labels.mentionSuggestions` ("People to mention").',
    states:
      'The formatting buttons are pressed where their format is on (`aria-pressed`). The editor has `aria-invalid`, `aria-required`, `aria-disabled` and `aria-readonly` as they apply. With `mentions` it has `aria-autocomplete="list"`; while the list is open it points at it (`aria-controls`) and at the active person (`aria-activedescendant`), who is `aria-selected`.',
    notes: [
      'A polite status says how many people the list shows (`labels.mentionResults`), and a slow search shows a loading indicator named `labels.mentionLoading` ("Finding people").',
      "Avatars in the mention list are decorative (`aria-hidden`), and the limit announcements, error and Send are the {@link MessageField}'s.",
    ],
  },
  focus: [
    "Focus stays in the text while the mention list is open: the list is pointed at, not focused, and pressing a person picks them without taking focus. The formatting buttons and the Aa tool don't take focus on a press either, so the selection stays.",
    'The tools and the formatting toolbar are one Tab stop each. The link dialog focuses its address field, and closing it puts focus back in the text.',
    "Keyboard focus in the text draws M3's focus indicator around the whole field; the active person is highlighted like a hovered row, with no focus ring. In forced-colours mode it is outlined in `Highlight`.",
  ],
  touchTarget: [
    'The formatting buttons, the Aa tool and the other field buttons are icon buttons with 48 × 48px touch targets. Each person in the mention list is a full-width row.',
  ],
  motion: [
    "Under reduced motion `autoFocus` brings the field into view at once instead of gliding, and the field's rows, Send and the link dialog keep only their fades, as in {@link MessageField}.",
  ],
  consumer: [
    'Name the field for what is being written ("Write a comment"), not only with a placeholder.',
    'Translate every word through `labels`, including each format, the link dialog and the mention strings.',
    "With `mentions`, give each person a `label` that names them; it is the option's text and the inserted mention.",
    'In forced-colours mode inline code, code blocks and quotes keep a `CanvasText` border, and the mention list keeps a border.',
  ],
};
