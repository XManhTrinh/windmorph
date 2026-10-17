import type { ComponentAccessibility } from './types';

export const sheets: ComponentAccessibility = {
  keyboard: [
    {
      keys: ['Tab', 'Shift + Tab'],
      action:
        "Moves through the sheet's controls. In a modal sheet focus is contained and never reaches the page behind; a standard sheet is part of the page's Tab order.",
    },
    {
      keys: ['Enter', 'Space'],
      action:
        'On the drag handle: expands a half-open modal sheet or a collapsed standard one, collapses a fully open standard sheet, and closes a fully open modal sheet.',
      where: 'Bottom sheet',
    },
    {
      keys: ['Escape'],
      action:
        'Closes a modal sheet in one press, from any height (a close request, as in a modal dialog), unless `closedBy="none"`. A fully open standard sheet collapses to its peek height.',
      where: 'Bottom sheet',
    },
    {
      keys: ['Escape'],
      action: 'Closes a modal side sheet.',
      where: 'Side sheet',
    },
  ],
  screenReader: {
    role: '`dialog`. Modal sheets are modal dialogs; a standard bottom sheet and a standard side sheet are non-modal dialogs.',
    name: '`BottomSheet`: `aria-label` or `aria-labelledby`, which its types require. `SideSheet`: its `title`, or `aria-label` / `aria-labelledby` when there is no visible title (an `aria-label` wins over the title).',
    states:
      "While a modal sheet is open the page behind is hidden from assistive tech. A closed standard side sheet is `inert`, so its content is neither focusable nor announced; so is the content below a collapsed standard bottom sheet's peek.",
    notes: [
      'The bottom sheet\'s drag handle is a `button` whose name says what pressing it does: `labels.expand` ("Expand sheet"), `labels.collapse` ("Collapse sheet") or `labels.dismiss` ("Close sheet").',
      'A standard bottom sheet opens collapsed to its peek height, or expanded with `defaultDetent="expanded"` (`detent` and `onDetentChange` control it). The handle, Escape and the collapse button move it between the two, and the handle\'s name always says which way a press goes.',
      'The scrim is decorative and hidden from assistive tech (`aria-hidden`).',
      'Inside a `SheetTrigger`, the trigger announces whether the sheet is open (`aria-expanded`) and points at it (`aria-controls`).',
    ],
  },
  focus: [
    'Opening a modal sheet moves focus to its first interactive element, as a dialog does: a bottom sheet\'s drag handle (M3: the handle takes initial focus), a side sheet\'s first icon button (M3: "Focus lands on (non-disabled) icon button"), or an element marked `autoFocus`. Focus is contained there, and closing returns it to the trigger.',
    "A standard sheet doesn't take, trap or move focus; the page stays usable around it.",
    "While a standard bottom sheet is collapsed, the parts of its content that don't fit entirely in the peek are `inert`: Tab and screen readers reach only what's on screen, and the drag handle, which expands the sheet. Collapsing it with focus in that part moves focus to the handle. Put anything that should stay reachable in the peek as the content's first child, sized to fit `peekHeight`.",
    "The drag handle shows M3's focus indicator inside its edges (a 3px `secondary` outline drawn within it), on keyboard focus only. The close, collapse and back buttons are {@link IconButton}s with the standard focus ring.",
    'A modal bottom sheet that fills the window shows a close button (`labels.close`), and a standard one that fills the window a collapse button (`labels.collapse`); `closeButton={false}` hides it. M3 requires a close button in every side sheet, so one is always shown (`labels.close`, `closeIcon`), and `onBack` adds a back button (`labels.back`).',
  ],
  touchTarget: [
    "The bottom sheet's drag handle spans the sheet's width and is 48px tall (a 4px bar with 22px above and below). Without a handle, the top 48px of the sheet still drags it.",
    'The close, collapse and back buttons are 48 × 48px icon buttons.',
    "On a touch screen, a drag down that starts on the content while it is scrolled to its top moves the sheet, and a drag up on a half-open sheet's content raises the sheet first, then scrolls the content; otherwise a drag on the content scrolls it. Sideways drags, form fields and elements that handle their own drags (such as sliders) are left alone, and a mouse drag on the content selects text as usual.",
  ],
  motion: [
    'Under reduced motion modal sheets fade in and out where they rest instead of sliding, and a bottom sheet moves to a new detent at once; a drag still follows the finger or pointer. A standard side sheet opens and closes its width at once. The scrim still fades.',
  ],
  consumer: [
    'Name every sheet: `aria-label` or `aria-labelledby` on a `BottomSheet`, a `title` (or `aria-label`) on a `SideSheet`.',
    'Pass `labels` to translate the drag handle, close, collapse and back buttons.',
    "Don't make dragging the only way to resize or close a sheet: keep the drag handle, or keep `closeButton` on, so keyboard and switch users can do the same.",
  ],
};
