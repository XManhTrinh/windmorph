# Plan: the time field (`TimeField`)

Status: **approved 2026-11-08, built**

## Goal

The time sibling of `DateField`, for forms that hold many times, such as a weekly schedule: one compact field per time that takes what people type, with the existing `TimePicker` a press away.

## When to use it

- A time in a form, especially several in a row. `TimePicker` in a `PickerDialog` alone suits a single, deliberate choice.

## API

`<TimeField label value defaultValue onChange min max hourCycle variant supportingText invalid errorMessage required disabled readOnly name id density labels classNames open defaultOpen onOpenChange inputRef clockIcon />`

- `value` is a `Time | null`. `Time` and `parseTime` are exported from `@windmorph/react`, so an app needs no date library of its own.
- `hourCycle` is `12` or `24`, the locale's by default, used by the field and the picker.
- `variant` is `outlined` (default, as `DateField`) or `filled`.

## Decisions

| # | Decision | Value |
|---|---|---|
| 1 | Field | The core `TextField`, with no input mask, at every density (48px at `-2`) |
| 2 | Typing and paste | `9`, `930`, `0930`, `9:30`, `9.30`, `9h30`, `21:30`, `9pm`, `9:30 pm`; the locale's digits and day periods too. Normalized on blur and Enter |
| 3 | Single-digit minutes | `9:3` is unreadable: it could mean 9:03 or 9:30, and a guess would store the wrong time unnoticed |
| 4 | Errors | Unreadable or out-of-range text stays as typed with an inline error; the value is unchanged until it is put right |
| 5 | Keyboard | `decimal` on a 24-hour clock, `text` on a 12-hour one, which needs letters for "pm" |
| 6 | Supporting text | None by default: the field is meant to repeat in rows, and it takes many forms. The format shows as the placeholder |
| 7 | Picker | `TimePicker` in `PickerDialog`, input mode first, `TimePickerModeToggle` for the dial; OK commits, Cancel discards; full screen below 600px. Loaded on demand, so a form of many fields carries none of it |
| 8 | Focus | Returns to the text box after a keyboard or mouse press on the clock. After a touch it returns to the clock button, since focusing the box would raise the on-screen keyboard |

## Tokens

None of its own. The core's token names are M3's (`scripts/m3-token-names.txt`), and M3 has no time field, so the field and button are themed through the text field's and icon button's tokens. The default width is a class in rem, so larger text widens it, and `className` replaces it.

## Checks

Unit tests for the parser and every state, axe, density, right to left, forced colours, layout safety, opening from inside a `Dialog`, visual regression across themes, modes and contrast.
