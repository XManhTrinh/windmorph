import type { ComponentAccessibility } from './types';

export const toolbars: ComponentAccessibility = {
  keyboard: [
    {
      keys: ['Tab', 'Shift + Tab'],
      action:
        'Moves through every control in order, then out of the toolbar. Tab enters at the first control and Shift + Tab at the last.',
    },
    {
      keys: ['Arrow Left', 'Arrow Right'],
      action:
        'Moves focus to the previous or next control, wrapping from the last to the first and back.',
      where: 'Horizontal toolbar',
    },
    {
      keys: ['Arrow Up', 'Arrow Down'],
      action:
        'Moves focus to the previous or next control, wrapping from the last to the first and back.',
      where: 'Vertical floating toolbar',
    },
    { keys: ['Home', 'End'], action: 'Moves focus to the first or the last control.' },
    { keys: ['Enter', 'Space'], action: 'Activates the focused control.' },
  ],
  keyboardNotes: [
    'Tab follows the M3 spec ("Tab or Arrows: Navigate between interactive elements") rather than the WAI-ARIA toolbar pattern, where the whole toolbar is a single Tab stop. The arrow keys, Home and End follow the WAI-ARIA toolbar.',
    'A text field in a toolbar keeps the arrow keys, Home and End for its caret.',
    'The horizontal arrow keys follow the DOM direction, so they are mirrored right to left.',
  ],
  screenReader: {
    role: '`toolbar` (`group` when nested in another toolbar), from React Aria. The controls inside keep their own roles.',
    name: 'The toolbar is named by `aria-label` or `aria-labelledby`, which the types require. `ToolbarFab` is named by its own `aria-label` or `aria-labelledby`, which its types require too.',
    states:
      'None of its own. The controls announce their own states, such as pressed for a toggle icon button.',
    notes: [
      'Collapsed leading and trailing controls (`expanded={false}`) stay in the accessibility tree, clipped to nothing, so a screen reader still reaches them.',
      'A toolbar that has left the screen (`visible={false}`) is `inert`, so it is out of the Tab order and the accessibility tree.',
      "`ToolbarFab`'s icon is hidden from assistive tech (`aria-hidden`).",
    ],
  },
  focus: [
    'Each control shows its own focus ring on keyboard focus.',
    "Collapsed controls stay in the Tab order. Focus reaching them, from the keyboard or a screen reader, expands the toolbar, and keyboard focus anywhere inside keeps it expanded; pointer focus on the always-shown controls doesn't.",
    '`ToolbarFab` shows its `aria-label` in a plain tooltip on hover and keyboard focus (`tooltip`, on by default).',
  ],
  touchTarget: [
    'The toolbars add no targets of their own. Their icon buttons are `standard` {@link IconButton}s, which keep their own 48 × 48px touch target.',
    '`ToolbarFab` is 56 × 56px, and 80 × 80px while the toolbar is collapsed.',
  ],
  motion: [
    'Under reduced motion a toolbar leaving the screen fades out instead of sliding off its edge.',
    "Collapsing and expanding happen at once, without the width animating. `ToolbarFab`'s `rotate` icon transition keeps only the crossfade.",
  ],
  consumer: [
    'Name every toolbar with `aria-label` or `aria-labelledby` ("Message actions").',
    'Give every icon-only control an `aria-label`, and `ToolbarFab` an `aria-label` that says what it does.',
    "Don't both collapse a floating toolbar and hide it (`expanded` and `visible`); M3 says a toolbar shouldn't do both, and the component warns in development.",
  ],
};
