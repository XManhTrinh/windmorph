# Plan: a media's length, formatted once

Status: **approved 2026-11-19**, with Windmorph Pro's `DurationTag` plan. **Built** (2026-11-19, merged in #105 for 0.2.11): `formatClock` and `formatDurationWords` in `@windmorph/react/primitives`, `ListItemVideo`'s `duration` in seconds with `labels.duration`. `ListItemVideo` has its own module since 2026-11-21, so lists of images and avatars don't load the formatting.

## Goal

Say a media's length the same way everywhere: as a clock for the eye ("4:12", "1:02:03") and in words for assistive technology ("4 minutes, 12 seconds"), in the page's language and digits. Today the core's `ListItemVideo` takes its length as a string and reads it as written, and Windmorph Pro keeps its own formatters inside its media time slider. Pro's new length tag on thumbnails needs them too, so they move to the core once, and every part shares them.

## Decisions

| # | Decision | Value |
|---|---|---|
| 1 | Where | `@windmorph/react/primitives`: `formatClock(seconds, locale, hours?)` and `formatDurationWords(seconds, locale)`, the functions Pro's slider uses today, unchanged. Pro then imports them and drops its copy |
| 2 | How | `Intl.NumberFormat` (plain and two-digit, no grouping) for the clock; `Intl.NumberFormat`'s long unit style joined by `Intl.ListFormat` (`type: 'unit'`) for the words. No translation table, and no `Intl.DurationFormat` (only since 2025 in every browser) |
| 3 | A time that isn't one | The formatters keep their behaviour (negative or not finite is 0); a component that shouldn't show 0 checks first |
| 4 | `ListItemVideo`'s `duration` | Takes seconds (a number) as well as a string. A number shows as the clock, marked left to right, in the locale's digits, with the words in a visually hidden text for assistive technology ("Length 4 minutes, 12 seconds"); the clock is hidden from it. A string is shown and read as written, as now |
| 5 | Its word | `labels.duration(words)`, default `Length ${words}`, under a new `ListItemVideo` key of the `LabelsProvider` |
| 6 | Its colours | Unchanged in this step. M3's list spec is read for the length label's colours before they change, since the core stays M3's |

## Checks

- The formatters: 0, 0.5, 7, 59.9, 60, 252, 3599, 3600, 3723 and 36000 seconds; negative, `NaN` and `Infinity`; `hours` forcing `h:mm:ss`; English, German and a language with its own digits (`ar-EG`); the words leaving out units at 0.
- `ListItemVideo`: a string as before; a number shows the clock and reads one text with the word and the time; the clock `aria-hidden` and `dir="ltr"`; `labels` and the `LabelsProvider`; the server's HTML equals the browser's; axe with `label-content-name-mismatch` inside a list item link.
- A changeset (`Added:`), and the List page's `ListItemVideo` example and props table updated.
