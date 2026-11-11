import type { ComponentAccessibility } from './types';

export const dataTable: ComponentAccessibility = {
  keyboard: [
    {
      keys: ['Tab'],
      action: 'Moves into the toolbar, the grid and the pagination; the grid is one tab stop.',
    },
    { keys: ['Arrow keys'], action: 'Move between cells and headers.', where: 'In the grid' },
    {
      keys: ['Home', 'End'],
      action: 'Move to the first or last cell of the row.',
      where: 'In the grid',
    },
    {
      keys: ['Enter', 'Space'],
      action:
        'On a header, sorts; Shift adds a sort level. On a row, activates it or toggles its selection.',
      where: 'In the grid',
    },
    {
      keys: ['R'],
      action:
        'On a header, starts resizing its column: the arrow keys change the width and Enter ends it. Enter before any arrow key fits the column to its content.',
      where: 'In the grid',
    },
  ],
  keyboardNotes: [
    'Dragging a header needs a pointer: column settings moves, shows, hides and pins columns from the keyboard.',
    'A cut-off value shows whole in its cell while the cell has keyboard focus.',
  ],
  screenReader: {
    role: 'A `grid`, with `columnheader`, `rowheader` and `gridcell`. A `plain` table with nothing to press is a native `table`. Below `compactBelow` it is a list.',
    name: 'From `aria-label` or `aria-labelledby`, which the types require; `aria-describedby` reaches the grid too.',
    states:
      '`aria-sort` on headers, `aria-selected` on rows, `aria-rowcount` from the true total and `aria-rowindex` by page, so a person knows where they are across pages.',
    notes: [
      'Each sort change is announced in a polite live region, every level of it, and so is a column fitted to its content (`labels.columnFitted`).',
      'The resize handle is described by `labels.resizeColumnHint`: the arrow keys resize, and Enter fits the content.',
      'The checkboxes are named after their rows through `labels.selectRow`.',
    ],
  },
  focus: [
    'Each cell and header shows the M3 focus indicator from the keyboard.',
    'When the bulk bar goes with focus in it, focus moves to the search that replaces it.',
    'A dialog returns focus to whatever opened it.',
  ],
  touchTarget: [
    'Rows, checkboxes and icon buttons keep 48px targets at density 0, and rows lose 4px a density step.',
    'A column’s resize handle is 16px wide for a pointer; on touch, use column settings or the keyboard route.',
  ],
  motion: [
    'Row states change with short fades only, which stay under reduced motion.',
    'In forced colours a selected row keeps `Highlight`.',
  ],
  consumer: [
    'Give the table a name, and every column a non-empty `header`: screen readers read it.',
    'Mark the column that names a row with `rowHeader`; the first is used otherwise.',
    'In server mode, pass the true `totalRows`, or the row counts will be wrong.',
    'Keep client mode to about 5,000 rows, and use server mode beyond it.',
    "Give text whose length follows the data or the language `width: 'fit'` rather than a guessed pixel width, so a translated value is not cut short.",
  ],
};
