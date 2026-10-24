import type { ComponentAccessibility } from './types';

export const search: ComponentAccessibility = {
  keyboard: [
    {
      keys: ['Tab', 'Shift + Tab'],
      action:
        'Moves focus between the icon buttons and the input. Focus alone does not expand the bar.',
      where: 'On the bar',
    },
    {
      keys: ['Arrow Down'],
      action: 'Expands the bar into the search view.',
      where: 'On the bar',
    },
    {
      keys: ['Enter'],
      action:
        'Expands the bar into the search view, as a click does (Compose expands the bar as its field takes focus); the query is submitted from the view.',
      where: 'On the bar',
    },
    {
      keys: ['Arrow Down'],
      action: 'Moves focus from the input to the first focusable item in the results.',
      where: 'In the search view',
    },
    {
      keys: ['Enter'],
      action:
        'Submits the query (`onSubmit`) and moves focus to the results, leaving the query visible.',
      where: 'In the search view',
    },
    {
      keys: ['Escape'],
      action: 'Collapses the search view.',
      where: 'In the search view',
    },
  ],
  keyboardNotes: [
    'Typing into the collapsed input, or pressing it, also expands the bar.',
    'Moving between results with the arrow keys is up to the results themselves, such as a {@link List}.',
  ],
  screenReader: {
    role: 'The collapsed input is a `combobox` whose popup is a `dialog` (`aria-haspopup="dialog"`). The expanded view is a modal `dialog` with its own `searchbox` input. `SearchAppBar` is a `header`.',
    name: "The input and the view are both named by the bar's `aria-label` or `aria-labelledby`, which the types require. The placeholder is not the name. The bar's `aria-describedby`, `aria-details` and `aria-description` describe both inputs (before an `inputProps['aria-describedby']`).",
    states: 'Expanded or collapsed (`aria-expanded` on the collapsed input).',
    notes: [
      'While the view is open, the collapsed input is `inert` and `aria-hidden`, so only one input is reachable.',
      '`resultsAnnouncement` ("5 results") is read by a polite live region (`role="status"`) inside the view when the view opens and whenever it changes, as M3 asks.',
    ],
  },
  focus: [
    'The bar is in the Tab order where it sits. Keyboard focus in the input draws the 3px `secondary` focus ring inside the pill; pointer presses show no ring.',
    "When the view opens, focus moves to the view's input with the caret after the query. Focus stays inside the view while it is open, and returns as soon as it starts closing to what had it when the view opened: the bar, so pressing or typing on it while the view leaves opens it again, or, when a keyboard shortcut opened the view, the element that was focused then.",
  ],
  touchTarget: [
    'The bar is 56px tall, and the leading and trailing icon slots are 48 × 48px.',
    'The icon buttons inside are `standard` {@link IconButton}s, which keep their own 48 × 48px touch target.',
  ],
  motion: [
    'The view grows out of the bar and shrinks back onto it on the M3 spatial springs, without overshooting the bar on the way back, and the docked results area resizes on a spring as the results change.',
    'Under reduced motion the docked field opens at its focused size at once, the results area resizes at once, and the dropdown only fades, without sliding.',
    'The full-screen view fades in and out over the window instead of growing from the bar.',
  ],
  consumer: [
    'Name the bar with `aria-label` or `aria-labelledby`, matching the placeholder ("Search mail"). A bar inside a `SearchAppBar` still needs its own name.',
    'Pass `resultsAnnouncement` with the number of suggestions or results, so screen readers hear the change.',
    'Give every icon-only button in `leadingIcon` and `trailingIcon` an `aria-label`, and give the full-screen view a back button that calls `collapse`.',
    'Build suggestions and results from a {@link List}, so they are announced as a list.',
  ],
};
