import type { ComponentAccessibility } from './types';

export const calendar: ComponentAccessibility = {
  keyboard: [
    { keys: ['Tab'], action: 'Moves into and out of the grid, which is one tab stop.' },
    { keys: ['Arrow keys'], action: 'Move between cells, skipping a time the day doesn’t have.' },
    { keys: ['Home', 'End'], action: 'Move to the row’s start or end.' },
    { keys: ['Ctrl + Home', 'Ctrl + End'], action: 'Move to the view’s first or last cell.' },
    { keys: ['Page Up', 'Page Down'], action: 'Change the period, keeping focus in the grid.' },
    { keys: ['Enter'], action: 'Moves into a cell’s events; on an event, activates it.' },
    { keys: ['Arrow keys'], action: 'Walk the cell’s events.', where: 'On an event' },
    { keys: ['Escape'], action: 'Returns to the cell, or cancels an operation.' },
    { keys: ['Space'], action: 'Starts a range: the arrows extend it and Enter confirms.' },
    {
      keys: ['M'],
      action: 'Picks up an event: the arrows move it and Enter drops it.',
      where: 'On an event',
    },
    {
      keys: ['R'],
      action: 'Resizes an event: the arrows change its end, Shift its start, and Enter confirms.',
      where: 'On an event',
    },
  ],
  keyboardNotes: [
    'Tab during an operation cancels it and leaves the grid.',
    'Left and Right mirror in right to left.',
  ],
  screenReader: {
    role: 'Every view is one `grid`: weeks and days in the month, slots and days or resources in the time views, resources and times in the timeline, and one column of days in the agenda.',
    name: 'From `aria-label` or `aria-labelledby`, which the types require. A cell is named with its date, time, resource and event count, and an event with its title, time, duration, resource and status.',
    states:
      '`aria-rowcount`, `aria-colcount` and their indexes carry the true size; `aria-selected` marks a range being chosen.',
    notes: [
      'A polite live region reports period changes, picks, moves, drops, rejections and cancels.',
      'Status is always words, and a blocked span has a pattern as well as a tint, so colour is never alone.',
    ],
  },
  focus: [
    'Focus stays in the grid when the period changes.',
    'A virtualized row or column that holds focus stays mounted when it scrolls away.',
  ],
  touchTarget: [
    'A long press starts a drag, so a swipe always scrolls.',
    'On touch, each event has a menu with the same moves, at a 48px target.',
  ],
  motion: [
    'Nothing in the calendar moves under reduced motion; an event only fades as it settles.',
    'In forced colours events keep a `CanvasText` border and today keeps `Highlight`.',
  ],
  consumer: [
    'Give the calendar a name.',
    'Pass `timeZone` and `now` when it renders on the server, so the first render is stable.',
    'Apply each change to `events` yourself, and return `false` to reject one: rejections are announced.',
    'Give an event a `status` in words where its colour carries meaning.',
  ],
};
