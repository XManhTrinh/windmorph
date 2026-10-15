import type { ComponentAccessibility } from './types';

export const messageField: ComponentAccessibility = {
  keyboard: [
    {
      keys: ['Enter'],
      action:
        'Sends, with `submitOn="enter"` (the default) on a computer. On a touch screen, with `submitOn="mod-enter"` or `"none"`, it starts a new line. Enter that confirms an input method\'s candidate never sends.',
      where: 'In the text',
    },
    {
      keys: ['Shift + Enter'],
      action: 'Starts a new line.',
      where: 'In the text',
    },
    {
      keys: ['Ctrl + Enter'],
      action: 'Sends, with `submitOn` `"enter"` or `"mod-enter"` (⌘ + Enter on a Mac).',
      where: 'In the text',
    },
    {
      keys: ['Escape'],
      action: 'Calls `onEscape` when given, for example to cancel a reply.',
      where: 'In the text',
    },
    {
      keys: ['Arrow Left', 'Arrow Right'],
      action: 'Moves between the tools, wrapping at the ends.',
      where: 'In the tools',
    },
    {
      keys: ['Home', 'End'],
      action: 'Moves to the first or last tool.',
      where: 'In the tools',
    },
    {
      keys: ['Enter', 'Space'],
      action: 'Sends. Focus and the caret stay in the text.',
      where: 'On Send',
    },
    {
      keys: ['Enter', 'Space'],
      action: 'Presses `MessageFieldTrigger`, or follows it with `href` (Enter only).',
      where: 'On `MessageFieldTrigger`',
    },
  ],
  keyboardNotes: [
    'Nothing is sent while the text is blank (unless `canSend`), over `maxLength`, or already sending.',
    'The tools are mirrored in right-to-left text, and so are the slots and the counter.',
  ],
  screenReader: {
    role: 'The text is a `textarea`. The tools are a `toolbar` of buttons; Send, the banner close and the slot buttons are icon buttons. `MessageFieldTrigger` is a `button`, or a `link` with `href`.',
    name: 'The text is named by the visible `label`, `aria-label` or `aria-labelledby`; the types require one, so the placeholder is never the only name. The tools toolbar is named `labels.tools` ("Tools"), Send `labels.send` ("Send", also its tooltip) and the banner close `labels.closeBanner` ("Close"). `MessageFieldTrigger` is named by its prompt, or its `aria-label`.',
    states:
      'The text has `aria-invalid` (also while over `maxLength`) and `aria-required`, and `aria-describedby` links `description` and `errorMessage`. Send is disabled while there is nothing to send. While sending it stays focusable with `aria-disabled`, and its loading indicator is a `progressbar` named `labels.sending` ("Sending").',
    notes: [
      'The error appears with the `alert` role, so it is announced. While it shows, the description is visually hidden but still read.',
      'A polite live region announces the limit once per change: `labels.nearLimit` from `counterThreshold`, then `labels.atLimit` and `labels.overLimit`. The visible counter is hidden from assistive tech.',
      "`MessageFieldTrigger`'s avatar, tools and trailing icon are decorative (`aria-hidden`).",
    ],
  },
  focus: [
    'The text, the tools (one Tab stop), the slot buttons and Send are in Tab order. Pressing the field anywhere outside its controls puts the caret in the text, and so do Send and the banner close.',
    "Keyboard focus in the text draws M3's focus indicator around the whole field: a 3px `secondary` outline 2px outside; pointer focus draws only the thicker focus border.",
  ],
  touchTarget: [
    'The field is 40, 48 or 56px tall (`sm`, `md`, `lg`). Its buttons are extra-small or small icon buttons with 48 × 48px touch targets.',
    '`MessageFieldTrigger` is as tall as the field; at `sm` (40px) it gets an invisible 48 × 48px touch target.',
  ],
  motion: [
    'Under reduced motion nothing moves or scales: rows open, Send appears and the field grows without movement, keeping only their fades, and an invalid send does not shake the field.',
    'The press ripple appears at full size without growing, and corner changes snap.',
  ],
  consumer: [
    'Name the field (`label`, `aria-label` or `aria-labelledby`) for what is being written ("Write a comment"), not only with a placeholder.',
    'Give every tool an `aria-label`, and translate every built-in word through `labels`, including the limit announcements.',
    'Explain a failed send in `errorMessage` with `invalid`, and keep `isSubmitting` on while a send is in flight.',
    "In forced-colours mode the field's border is `CanvasText`, `Highlight` while focused and `GrayText` while disabled; keep `classNames` overrides from removing it.",
  ],
};
