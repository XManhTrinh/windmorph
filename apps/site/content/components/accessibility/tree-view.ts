import type { ComponentAccessibility } from './types';

export const treeView: ComponentAccessibility = {
  keyboard: [
    { keys: ['Tab'], action: 'Moves into and out of the tree, which is one tab stop.' },
    { keys: ['Arrow Up', 'Arrow Down'], action: 'Move between rows.' },
    { keys: ['Arrow Right'], action: 'Opens a closed row, then moves into its controls.' },
    { keys: ['Arrow Left'], action: 'Closes an open row, or moves out of its controls.' },
    { keys: ['Home', 'End'], action: 'Move to the first or last row.' },
    { keys: ['Enter', 'Space'], action: 'Activates or selects the row.' },
  ],
  keyboardNotes: [
    'Typing moves to the next row starting with those letters.',
    'Left and Right mirror in right to left.',
  ],
  screenReader: {
    role: 'A `treegrid` with `row` and `gridcell`.',
    name: 'From `aria-label` or `aria-labelledby`, which the types require. Each row is named by its `textValue`.',
    states: '`aria-expanded`, `aria-level`, `aria-posinset`, `aria-setsize` and `aria-selected`.',
    notes: ['A loading or failed row is a real row, so a keyboard can reach its retry.'],
  },
  focus: ['Each row shows the M3 focus indicator from the keyboard.'],
  touchTarget: ['Rows and expand buttons are 48px at density 0 and lose 4px a density step.'],
  motion: [
    'The chevron turns on the fast spatial spring and snaps under reduced motion.',
    'In forced colours a selected row keeps an edge.',
  ],
  consumer: [
    'Give the tree a name, and return a useful `textValue` for each row.',
    'Name any control in a row after that row.',
  ],
};
