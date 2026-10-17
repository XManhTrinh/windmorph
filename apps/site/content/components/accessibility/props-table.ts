import type { ComponentAccessibility } from './types';

export const propsTable: ComponentAccessibility = {
  keyboard: [
    {
      keys: ['Tab'],
      action: 'Moves to the table, which takes focus so it can be scrolled.',
    },
    {
      keys: ['Arrow Left', 'Arrow Right'],
      action: 'Scrolls a table wider than its space sideways.',
    },
  ],
  screenReader: {
    role: 'A `region` around a real `<table>` with a `<caption>`. Column headings are `th` with `scope="col"`, and each row starts with the prop name as a `th` with `scope="row"`, so table navigation reads each cell with its column and its prop.',
    name: 'The region and the table are both named by `caption`, or `labels.caption` ("Properties"). The caption is visually hidden.',
    states:
      'A required prop is followed by the word "required" (`labels.required`); the asterisk you see is hidden.',
  },
  focus: [
    'The scroll region takes focus with Tab (WCAG 2.1.1), so a keyboard can scroll it. It shows the M3 focus indicator: a 3px `secondary` outline 2px outside its border.',
    'The table holds nothing else to focus.',
  ],
  touchTarget: { none: 'It has nothing to press; the region scrolls with a swipe.' },
  motion: { none: 'Nothing in it moves.' },
  consumer: [
    'Give each table a `caption` that says whose props it lists ("Button props"), so regions on a page with several tables have different names.',
    'Keep descriptions plain text, and pass `labels` to translate the headings and the word "required".',
  ],
};
