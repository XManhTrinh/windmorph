import type { ComponentAccessibility } from './types';

export const buttonGroup: ComponentAccessibility = {
  keyboard: [
    {
      keys: ['Tab', 'Shift + Tab'],
      action:
        'Moves focus into the group (back to the button focused last, when there is one; to the selected button in a single-selection group), and out of it in one step.',
    },
    {
      keys: ['Arrow Left', 'Arrow Right'],
      action:
        'Moves focus to the previous or next button, wrapping from one end to the other (the WAI-ARIA toolbar).',
      where: 'Without selection, or with multiple selection',
    },
    {
      keys: ['Home', 'End'],
      action: 'Moves focus to the first or the last button.',
      where: 'Without selection, or with multiple selection',
    },
    {
      keys: ['Arrow Left', 'Arrow Right', 'Arrow Up', 'Arrow Down'],
      action:
        'Moves to the previous or next option and selects it, wrapping from one end to the other (the WAI-ARIA radio group its `radiogroup` role announces, as `RadioGroup` does). The overflow button is on the same path, and is focused without being selected.',
      where: 'Single selection',
    },
    {
      keys: ['Home', 'End'],
      action: 'Selects the first or the last option.',
      where: 'Single selection',
    },
    {
      keys: ['Enter', 'Space'],
      action:
        'Activates the focused button, selects the focused option in a single-selection group, or toggles it in a multiple-selection group.',
    },
  ],
  keyboardNotes: [
    'The arrow keys follow the laid-out direction, so they are mirrored in right-to-left layouts.',
    'In a multiple-selection group the arrow keys only move focus; Enter or Space toggles. In a single-selection group selection follows focus, as screen reader users expect of radio buttons (2026-10-15; M3 lists the arrows as moving focus for every group).',
    'Disabled buttons, and buttons folded into the overflow menu, are skipped.',
  ],
  screenReader: {
    role: '`toolbar` of buttons without `selectionMode`; `radiogroup` of `radio`s with `selectionMode="single"`; `toolbar` of toggle buttons with `selectionMode="multiple"`. Nested in another toolbar, the group becomes a `group` and the outer toolbar handles the arrow keys.',
    name: 'The group takes `aria-label` or `aria-labelledby`; each button keeps its own name.',
    states:
      'Checked or not checked (`aria-checked`) for each radio, pressed or not pressed (`aria-pressed`) for each multiple-selection toggle, and `aria-disabled` on a disabled group.',
    notes: [
      'With `overflow`, the trailing "More options" icon button (`labels.more`) opens a {@link Menu} of the folded buttons, named by their labels: actions as `menuitem`s, toggles as `menuitemcheckbox`es (`menuitemradio`s in a single-selection group), showing their state, and disabled buttons disabled.',
    ],
  },
  focus: [
    'The group is one Tab stop; the arrow keys move between its buttons, and focus comes back to the last focused button when Tab re-enters, or to the selected one in a single-selection group.',
    "Each button shows M3's focus indicator under keyboard focus: a 3px `secondary` outline 2px outside it.",
    'The overflow menu takes focus when it opens and gives it back to the "More options" button when it closes, as any {@link Menu} does.',
  ],
  touchTarget: [
    'Extra-small and small buttons keep their invisible 48 × 48px touch targets. A standard group spaces them 18px (XS) and 12px (S) apart, so the targets of neighbours never overlap.',
    'In a connected group, extra-small and small icon buttons are at least 48px wide; buttons sit 2px apart at every size.',
    "A group follows the density of the icon buttons inside (the theme's or a `ThemeScope`'s): they get smaller and keep their gaps and 48px targets, which can meet in the gaps but never reach a neighbour.",
  ],
  motion: [
    "Under reduced motion a pressed button doesn't grow into its neighbours' space, and the press and selection morphs snap to their new corners. Colours still fade.",
  ],
  consumer: [
    'Name the group with `aria-label` (for example "Calendar view" or "Text formatting"), and give icon buttons in it their own `aria-label`.',
    'Pass `labels` to translate "More options".',
    'With `overflow`, put the actions in order of importance: the trailing ones are folded first.',
    'Use a connected group for selection, with toggle buttons that have a `value`, and a standard group for actions.',
  ],
};
