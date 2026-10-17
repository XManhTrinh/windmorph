---
'@windmorph/react': minor
---

Initial release of Windmorph: Material 3 Expressive components for React.

Navigation bar and rail labels wrap between words and never break a word bare: a word wider than its item breaks only where the browser hyphenates it for the page's `lang`, and a line it still overflows ends with an ellipsis, while the accessible name keeps the full label.

A `data-tokens` value passed to a component is appended to the component's own token set instead of replacing it, so an app or a library can add its own token set to a core component's root and keep the component's styles. `mergeDataTokens` (from `@windmorph/react/primitives`) merges the two the same way.

When a press opens a list item while an open item above it folds, the pressed row stays where it was on screen and the page scrolls by the fold instead. `useKeepPressedInPlace` (from `@windmorph/react/primitives`) gives a container of your own the same hold.

A selectable list's options are named by all their visible text (overline, headline, supporting and trailing text, in order) instead of the headline alone with the supporting text as a description, so the accessible name contains the visible label (WCAG 2.5.3) and screen readers read each part once.

Touch targets (`TouchTarget` and the M icon button's) are 48px in px, so they keep their size when a reader raises the browser's font size instead of growing with the text and overlapping their neighbours.

Menu items with a `description` are named by their label and supporting text instead of the label alone with the supporting text as a description, so the accessible name contains the visible label (WCAG 2.5.3); the `shortcut` and `badge` are still read as the description, once.

`Tabs` takes `disabled`, `TooltipTrigger` and `RichTooltipTrigger` take `disabled` and `open`, like the rest of the library, instead of React Aria's `isDisabled` and `isOpen`; `onOpenChange` receives `open`. The `Overlay` primitive's `isExiting` is now `exiting`, and `OptionPopover`'s `isNonModal` is now `nonModal`.

The date and time pickers take their words in `labels`, like every other component, instead of `strings`: `DateField`, `DatePicker`, `DateRangePicker`, `PickerDialog`, `TimePicker` and `TimePickerModeToggle`, with the types `DateFieldLabels`, `DateInputLabels`, `DatePickerLabels`, `PickerDialogLabels` and `TimePickerLabels`. Every labels type lists all its keys, and the `labels` prop takes any of them (`Partial<…Labels>`), `Badge`'s included.

`Checkbox` and `Switch` take `checked`, `defaultChecked` and `onCheckedChange`, as HTML and Compose name them, instead of `selected`, `defaultSelected` and `onSelectedChange`; checkboxes, switches and radios mark their state with `data-checked` instead of `data-selected` (a checkbox's `data-indeterminate` is unchanged). Toggle buttons, chips and navigation items keep `selected`.

`Slider`, `RangeSlider`, `DatePicker`, `DateRangePicker` and `DateField` take `min` and `max`, as HTML's range and date inputs do, instead of `minValue` and `maxValue`.

Props that show or hide an optional part are named after the part: `valueLabel` on `Slider` and `RangeSlider` (was `showValueLabel`), `header` and `modeToggle` on `DatePicker` and `DateRangePicker` (were `showHeader` and `showModeToggle`), and `counter` on `TextField` (was `showCharacterCount`).

`Slider`'s inset icons are `leadingIcon` and `trailingIcon`, the names every other icon slot uses, instead of `startIcon` and `endIcon`.
