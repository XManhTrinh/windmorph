import type { ComponentAccessibility } from './types';

export const dataGrid: ComponentAccessibility = {
  keyboard: [
    { keys: ['Tab'], action: 'Moves into and out of the grid, which is one tab stop.' },
    { keys: ['Arrow keys'], action: 'Move between cells, including headers and row headers.' },
    { keys: ['Page Up', 'Page Down'], action: 'Move by a screenful of rows.' },
    { keys: ['Home', 'End'], action: 'Move to the row’s start or end.' },
    { keys: ['Ctrl + Home', 'Ctrl + End'], action: 'Move to the grid’s first or last cell.' },
    { keys: ['Shift + Arrow keys'], action: 'Extends the selected range.' },
    { keys: ['Enter', 'F2'], action: 'Edits the cell; on a row header, moves to its controls.' },
    { keys: ['Enter', 'Tab'], action: 'Commits and moves down or across.', where: 'While editing' },
    { keys: ['Escape'], action: 'Cancels an edit, or clears the range.' },
    { keys: ['Delete', 'Backspace'], action: 'Clears the selected cells.' },
    { keys: ['Ctrl + A'], action: 'Selects every cell.' },
    { keys: ['Ctrl + C', 'Ctrl + V'], action: 'Copy and paste as tab-separated text.' },
  ],
  keyboardNotes: [
    'Typing starts an edit with the key typed.',
    'Left and Right mirror in right to left.',
  ],
  screenReader: {
    role: 'A `grid` with `row`, `columnheader`, `rowheader` and `gridcell`, with `aria-rowindex` and `aria-colindex` on each.',
    name: 'From `aria-label` or `aria-labelledby`, which the types require.',
    states:
      '`aria-rowcount` and `aria-colcount` carry the true size. Cells expose `aria-selected`, `aria-invalid` and `aria-readonly`, and an invalid cell is described by its message.',
    notes: [
      'A cell’s state is an icon named by its label, so colour is never alone.',
      'Validation messages and pastes are announced in a polite live region.',
    ],
  },
  focus: [
    'The active cell keeps focus and the tab stop when it scrolls out of the rendered window.',
    'If rows or columns shrink under it, the active cell moves to one that exists.',
    'A finished edit returns focus to the cell, or the next one.',
  ],
  touchTarget: [
    'Rows are 48px tall at density 0 and lose 4px a density step.',
    'Editing happens in a field that fills the cell.',
  ],
  motion: { none: 'Nothing in the grid moves; its rows scroll with the page’s own scrolling.' },
  consumer: [
    'Give the grid a name, and every column a non-empty `header`.',
    'Set a `validate` message that says how to put the value right.',
    'Give every state from `getCellState` a `label`.',
    'Keep `rows` and `onCellChange` in step: the grid holds no data of its own.',
  ],
};
