# Plan: a docked list of times for `TimeField`

Status: **plan, waiting for approval** (2026-11-11). Nothing is built.

## The problem

`TimeField`'s picker is always a dialog (full screen below 600px). In a form with many times, such as a weekly schedule, each pick on a wide window is a modal round trip: open, set the hour and the minute, confirm. `DateField` already docks its calendar under the field on wide windows and keeps the full-screen picker for compact ones.

## What exists elsewhere

- M3's time picker has a dial and an input mode, both in a dialog. It defines no docked time picker, and no time field either: `TimeField` is already this library's own (`docs/plans/time-field.md`).
- On wide windows, scheduling and booking forms commonly show a list of times at a fixed step under the field, and keep the text box for anything in between.
- HTML's `<input type="time">` takes a `step` and a `<datalist>` of suggested times.

## Proposal

A `presentation` prop on `TimeField`, with the dialog as it is today by default.

| # | Decision | Value |
|---|---|---|
| 1 | Prop | `presentation`: `dialog` (default) or `docked`, the word `Menu` and `Select` use for where their list opens |
| 2 | Docked | At 600px and wider the clock button opens a list of times under the field. On compact windows it opens the dialog, full screen, as today and as `DateField` does |
| 3 | The list | Every `step` minutes (a new prop, default `30`) from `min` to `max`, written as the field writes times (`hourCycle`, the locale's digits). A value between two steps is listed too, selected |
| 4 | Opening | The list opens scrolled to the field's time, selected; with no time, to the step nearest the current time of day |
| 5 | Picking | A press or Enter on a time commits it (`onChange`) and closes the list; Escape or a press outside closes it and changes nothing |
| 6 | Typing | The text box works as today (every form it reads, errors inline). The list is a second way in, not a filter |
| 7 | Keyboard and focus | The list takes focus as `Select`'s does: arrows, Home, End, Page Up and Page Down, digits to jump to an hour. Focus returns as decision 8 of the time field's plan: to the text box, or to the clock button after a touch |
| 8 | Semantics | The clock button has `aria-haspopup="listbox"`, `aria-expanded` and `aria-controls`; the list is a `listbox` named by `labels.title` ("Select time"), its times are `option`s with `aria-selected` |
| 9 | Built from | The core's option popover and list, as `Select` and `Autocomplete`, so the menu's tokens, density and motion apply. Loaded on demand, so a form of many fields carries none of it |
| 10 | Not built | A docked dial, or scrolling hour and minute columns: neither is M3, and neither is quicker than typing |

## API

```tsx
<TimeField label="Opens at" presentation="docked" step={15} value={time} onChange={setTime} />
```

- `presentation?: 'dialog' | 'docked'` (default `dialog`).
- `step?: number`, minutes between the listed times (default `30`); it only shapes the list, and typed times stay free.
- `classNames.list` and `classNames.option` for the docked list; `classNames.picker` stays the dialog's surface.
- No new words: the list is named by `labels.title`.

## Tokens

None of its own, as the field: the list is painted by the menu's tokens.

## Checks

- Unit: the list for a step, `min`, `max` and each hour cycle; an off-step value is listed; a pick commits and closes; Escape changes nothing; the keyboard; where focus returns; a compact window opens the dialog.
- Axe in each state, right to left, density, forced colours, layout safety, the theme scope.
- A story, visual regression across themes, modes and contrast, and reduced motion.
- Docs: an example and a playground option on the time field's page, the API table, a changeset (`Added:`).

## Open questions

1. **Where:** a prop on the core's `TimeField` (recommended: the field is already the library's own, and a second component would repeat it), or a separate component outside the core?
2. **Default:** keep `dialog` (recommended: nothing changes for apps that use the field today), or dock on wide windows by default, as `DateField` does?
3. **Step:** 30 minutes by default (recommended), or 15?
