import type { ComponentAccessibility } from './types';

export const radioGroup: ComponentAccessibility = {
  keyboard: [
    {
      keys: ['Tab', 'Shift + Tab'],
      action:
        'Moves focus into the group, to the selected option, and out of it in one step. With nothing selected, Tab enters on the first option and Shift + Tab on the last.',
    },
    {
      keys: ['Arrow Down', 'Arrow Right'],
      action: 'Moves focus to the next option and selects it.',
    },
    {
      keys: ['Arrow Up', 'Arrow Left'],
      action: 'Moves focus to the previous option and selects it.',
    },
    { keys: ['Space'], action: 'Selects the focused option, if it is not selected yet.' },
  ],
  keyboardNotes: [
    'The arrow keys wrap from the last option to the first and back, and skip disabled options.',
    'In a right-to-left locale, Arrow Left and Arrow Right are mirrored in a horizontal group.',
  ],
  screenReader: {
    role: 'The group is a `radiogroup` (React Aria `useRadioGroup`) with `aria-orientation`. Each option is a visually hidden native `<input type="radio">`, inside a `<label>`.',
    name: 'The group is named by its `label`, or by `aria-label` or `aria-labelledby` without one. Each option is named by its label (`children`), or its own `aria-label`.',
    states:
      'Checked or not checked on each option, and disabled, required, invalid (`aria-invalid`) and read-only on the group.',
    notes: [
      "Supporting text is the group's description. While the group is invalid, the error message takes its place below the options and is announced as an alert.",
      'The drawn ring and dot are hidden from assistive tech; the native inputs carry the state, so forms and labels work as they do natively.',
    ],
  },
  focus: [
    'The group is one Tab stop, the selected option. Disabled options, and every option of a disabled group, are skipped.',
    'A read-only group can be focused and moved through, but its selection does not change.',
    "Keyboard focus shows M3's focus indicator around the focused option's 40px control: a 3px `secondary` outline 2px outside it, with the focus state layer. Pointer presses show no ring.",
  ],
  touchTarget: [
    'Each 20px ring sits in a 40px control with an invisible 48 × 48px touch target. The whole label is part of the target too, since each option is a `<label>`.',
    "With `density` (or the theme's), each control loses 4px a step, to 28px at -3, and the group puts 2px more between rows a step, so an option's 48 × 48px target never reaches the next option's ring. M3 asks not to apply density by default: offer it as the reader's choice.",
  ],
  motion: [
    'Under reduced motion the dot appears at full size instead of growing in, and the colours still fade. The press ripple appears at full size without growing.',
  ],
  consumer: [
    'Name the group with a visible `label` that asks the question, and give every option a visible label.',
    'Render each `Radio` inside a `RadioGroup`: a `Radio` on its own throws when it renders.',
    'Use a `RadioGroup` for one choice from a short list; for a longer one use a {@link Select}.',
  ],
};
