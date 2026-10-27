import type { ComponentAccessibility } from './types';

export const chips: ComponentAccessibility = {
  keyboard: [
    {
      keys: ['Tab'],
      action:
        'Moves focus to the chip. A `ChipSet` is one Tab stop: Tab enters it and the next Tab leaves it.',
    },
    {
      keys: ['Enter', 'Space'],
      action:
        "Activates an assist or suggestion chip, selects or deselects a filter chip, and runs an input chip's `onPress` or its remove button.",
    },
    {
      keys: ['Enter'],
      action: 'Follows an assist chip with `href`. Space scrolls the page, as on any link.',
      where: 'Assist chip with `href`',
    },
    {
      keys: ['Backspace', 'Delete'],
      action:
        'Removes a chip that has `onRemove`, from the chip or its remove button. A disabled chip ignores them.',
      where: 'Removable filter and input chips',
    },
    {
      keys: ['Arrow Right', 'Arrow Down'],
      action:
        "Moves focus to the next chip, or to a chip's remove button, without selecting it. It stops at the last one.",
      where: 'In a `ChipSet` without single selection',
    },
    {
      keys: ['Arrow Left', 'Arrow Up'],
      action: 'Moves focus to the previous chip or remove button. It stops at the first one.',
      where: 'In a `ChipSet` without single selection',
    },
    {
      keys: ['Home', 'End'],
      action: 'Moves focus to the first or the last chip in the set.',
      where: 'In a `ChipSet` without single selection',
    },
    {
      keys: ['Arrow Right', 'Arrow Down', 'Arrow Left', 'Arrow Up'],
      action:
        'Moves to the next or previous chip and selects it, wrapping from one end to the other (the WAI-ARIA radio group its `radiogroup` role announces, as `RadioGroup` does).',
      where: 'In a single-select `ChipSet`',
    },
    {
      keys: ['Home', 'End'],
      action: 'Selects the first or the last chip.',
      where: 'In a single-select `ChipSet`',
    },
  ],
  keyboardNotes: [
    'In a right-to-left layout Arrow Left and Arrow Right swap.',
    'Leaving a `ChipSet` with Tab and coming back returns focus to the chip that had it; a single-select set returns it to the selected chip. A pointer press focuses the chip it lands on.',
    'In a multiple-select set the arrow keys only move focus; Enter or Space selects. M3 lists the arrows as moving focus for every chip set; a single-select set follows the radio group pattern instead, because its chips are announced as radio buttons and that is what screen reader users expect of them (2026-10-15).',
  ],
  screenReader: {
    role: '`AssistChip` and `SuggestionChip` are a `button` (an assist chip with `href` is a `link`). `FilterChip` is a toggle `button`, or a `radio` in a single-select `ChipSet`. `ChipSet` is a `group`, or a `radiogroup` with `selectionMode="single"`.',
    name: 'The chip\'s label (`children`). The remove button is named from `labels.remove` plus the label ("Remove Alex"). A `ChipSet` takes `aria-label` or `aria-labelledby`, which its types require.',
    states:
      'A filter chip announces pressed (`aria-pressed`), or checked (`aria-checked`) in a single-select set. An input chip with `onPress` and `selected` announces pressed; a selected input chip without `onPress` is described as "Selected" (`labels.selected`), on its remove button or as hidden text. Disabled on every chip; a disabled `ChipSet` sets `aria-disabled`.',
    notes: [
      'Leading icons, avatars, the filter check, the trailing icon and the close icon are decorative and hidden from assistive tech (`aria-hidden`).',
      'An input chip with neither `onPress` nor `onRemove` is static text, with no role and no focus stop.',
    ],
  },
  focus: [
    'Each chip is a focus stop. A filter chip with `onRemove`, and an input chip with `onPress` and `onRemove`, are two stops: the chip and its remove button.',
    'An input chip with only `onRemove` is one stop, its remove button, and the focus ring circles the whole chip, as M3 asks.',
    "Keyboard focus shows M3's focus indicator: a 3px `secondary` outline 2px outside the chip (or around the remove button), and a flat chip's border darkens. Pointer presses show no ring.",
    'When the focused chip is removed, focus moves to the next stop in the `ChipSet`, or the previous one at the end, or the set itself once it is empty, so keyboard users keep their place.',
  ],
  touchTarget: [
    'Chips are at least 32px tall. An invisible `TouchTarget` gives each chip a 48px-tall touch target without changing its layout.',
    'The remove button is 24px with its own 48 × 48px `TouchTarget`. A chip with a remove button is at least 88px wide, so that target never covers the label.',
    'A scrolling `ChipSet` (`layout="scroll"`) pads its row so the touch targets and focus rings stay inside the scroll area, and keeps a thin scrollbar (in `outline`), so a mouse user sees that more chips lie beyond the edge and can reach them. Where every chip must be seen at once, use the default wrapping layout.',
    "With `density` (or the theme's), chips lose 4px a step, to 24px at -2 and -3, and keep their 48px targets, as M3 asks of chips at every density. A wrapping `ChipSet` puts 2px more between rows a step (12px at -2 and -3), and a scrolling one pads its row by as much, so a chip's target never reaches the chips above or below it.",
  ],
  motion: [
    "Under reduced motion a filter chip's check and its padding change appear at once instead of sliding open, and the check fades in. The press ripple appears at full size without growing. Colours and elevation still fade.",
  ],
  consumer: [
    'Give every `ChipSet` a name with `aria-label`, or `aria-labelledby` pointing at a visible heading.',
    'Keep chip labels short and unique within a set, so the remove buttons\' names ("Remove Alex") stay distinct.',
    "Pass `labels` to translate the remove button's name (`labels.remove`) and the word that describes a selected input chip (`labels.selected`).",
    'Use `outline="strong"` where nothing else shows that a flat chip is interactive, so its border meets 3:1 contrast.',
  ],
};
