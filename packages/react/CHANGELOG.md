# @windmorph/react

## 0.1.0

### Minor Changes

- Initial release of Windmorph: Material 3 Expressive components for React.

  Navigation bar and rail labels wrap between words and never break a word bare: a word wider than its item breaks only where the browser hyphenates it for the page's `lang`, and a line it still overflows ends with an ellipsis, while the accessible name keeps the full label.

  A `data-tokens` value passed to a component is appended to the component's own token set instead of replacing it, so an app or a library can add its own token set to a core component's root and keep the component's styles. `mergeDataTokens` (from `@windmorph/react/primitives`) merges the two the same way.

  When a press opens a list item while an open item above it folds, the pressed row stays where it was on screen and the page scrolls by the fold instead. `useKeepPressedInPlace` (from `@windmorph/react/primitives`) gives a container of your own the same hold.

  A selectable list's options are named by all their visible text (overline, headline, supporting and trailing text, in order) instead of the headline alone with the supporting text as a description, so the accessible name contains the visible label (WCAG 2.5.3) and screen readers read each part once.

  Touch targets (`TouchTarget` and the M icon button's) are 48px in px, so they keep their size when a reader raises the browser's font size instead of growing with the text and overlapping their neighbours.

  The 35 M3 Expressive shapes come precomputed for static use, one constant each (`circleShape` … `heartShape`, each a `MaterialShapePath` with a `name` and an SVG `path` in the unit square), plus `materialShapePaths` (all of them by name), from `@windmorph/react/primitives`. `materialShapeMask` takes a `MaterialShapePath` instead of a shape name (`materialShapeMask(cookie12SidedShape)`, or `materialShapeMask(materialShapePaths[name])`) and no longer loads the shape engine, so a static shape costs an app only its outline. `materialShapeNames` and `MaterialShapeName` are unchanged.

  Menu items with a `description` are named by their label and supporting text instead of the label alone with the supporting text as a description, so the accessible name contains the visible label (WCAG 2.5.3); the `shortcut` and `badge` are still read as the description, once.

  `Tabs` takes `disabled`, `TooltipTrigger` and `RichTooltipTrigger` take `disabled` and `open`, like the rest of the library, instead of React Aria's `isDisabled` and `isOpen`; `onOpenChange` receives `open`. The `Overlay` primitive's `isExiting` is now `exiting`, and `OptionPopover`'s `isNonModal` is now `nonModal`.

  The date and time pickers take their words in `labels`, like every other component, instead of `strings`: `DateField`, `DatePicker`, `DateRangePicker`, `PickerDialog`, `TimePicker` and `TimePickerModeToggle`, with the types `DateFieldLabels`, `DateInputLabels`, `DatePickerLabels`, `PickerDialogLabels` and `TimePickerLabels`. Every labels type lists all its keys, and the `labels` prop takes any of them (`Partial<…Labels>`), `Badge`'s included.

  `Checkbox` and `Switch` take `checked`, `defaultChecked` and `onCheckedChange`, as HTML and Compose name them, instead of `selected`, `defaultSelected` and `onSelectedChange`, and a switch's thumb icons are `checkedIcon` and `uncheckedIcon` (were `selectedIcon` and `unselectedIcon`); checkboxes, switches and radios mark their state with `data-checked` instead of `data-selected` (a checkbox's `data-indeterminate` is unchanged). Toggle buttons, chips and navigation items keep `selected`.

  `Slider`, `RangeSlider`, `DatePicker`, `DateRangePicker` and `DateField` take `min` and `max`, as HTML's range and date inputs do, instead of `minValue` and `maxValue`.

  Props that show or hide an optional part are named after the part: `valueLabel` on `Slider` and `RangeSlider` (was `showValueLabel`), `header` and `modeToggle` on `DatePicker` and `DateRangePicker` (were `showHeader` and `showModeToggle`), and `counter` on `TextField` (was `showCharacterCount`).

  `Slider`'s inset icons are `leadingIcon` and `trailingIcon`, the names every other icon slot uses, instead of `startIcon` and `endIcon`.

  `Dialog`, `BottomSheet`, `SideSheet` and `PickerDialog` take `closedBy` (`'any' | 'closerequest' | 'none'`, as HTML's `<dialog closedby>`) instead of `dismissable` and `keyboardDismissDisabled`; the defaults are unchanged (`'closerequest'` for an alert dialog, `'any'` otherwise). Escape closes a modal bottom sheet in one press, from any height, instead of first lowering a fully open sheet to half; `closedBy="none"` also keeps a drag down from closing it.

  `SideSheet` takes `edge` (`'start' | 'end'`, default `'end'`, logical so it mirrors in RTL), and a modal side sheet closes on a touch or pen swipe toward its edge (past half its width, or a fling; vertical scrolling and the content's own sideways drags keep working). `SideSheet` and `BottomSheet` take `swipeable` (default `true`) to turn dragging off; a controlled `open` left `true` keeps a swiped sheet open, and it springs back.

  `ButtonGroup`, `ChipSet`, `List` and `Menu` take `deselectable` (default `true`) instead of `disallowEmptySelection`: pass `deselectable={false}` to keep at least one item selected.

  React Aria's own prop names no longer leak through: `Autocomplete` takes `allowCustomValue` (was `allowsCustomValue`), `Select` takes `closeOnSelect` (was `shouldCloseOnSelect`), `Switch` takes `required` and `invalid`, and the deprecated `selectedKey` / `defaultSelectedKey` / `onSelectionChange` (on `Select` and `Autocomplete`, which take `value` / `defaultValue` / `onChange`), `validationState`, `excludeFromTabOrder`, `allowsEmptyCollection`, `shouldFocusWrap` and `escapeKeyBehavior` are gone.

  The arrow keys wrap at the ends of a `Menu` and of the `Select` and `Autocomplete` option lists, as they do in lists, tabs and toolbars.

  `Tabs` takes `value`, `defaultValue` and `onChange`, as `Select` and `RadioGroup` do, instead of `selectedKey`, `defaultSelectedKey` and `onSelectionChange`, and a radio `List` reports its choice with `onChange` instead of `onValueChange`. Disabled tabs stay focusable, so screen reader users find them, but can't be selected.

  Disabled items in an interactive `List` (actions, selection or nested items) take focus with the arrow keys, as the WAI-ARIA practices recommend, but can't be pressed, selected, expanded or followed.

  Placement props share one vocabulary: `NavigationBar` takes `iconPlacement` (was `iconPosition`, now matching `Tabs`), `FloatingToolbar` takes `fabPlacement` (was `fabPosition`), and `List` / `ListItem` `controlPlacement` takes `start` or `end` (was `leading` or `trailing`).

  Placements are hyphenated, like every other multi-word value: `'bottom-start'`, `'top-end'` and so on for `TooltipTrigger`, `RichTooltipTrigger` and `Menu` (whose placements are now the `MenuPlacement` type, logical sides only), instead of `'bottom start'`.

  `Dialog`'s `quick` is `instant`, the name `Menu` uses for the same thing.

  `DialogHeader` takes `labels.close` (default "Close") instead of the required `closeLabel`, and `closeDisabled` to disable its full-screen close button while the confirming action runs, and `SplitButton` takes `labels.menu` (default "More options") instead of the required `menuLabel`.

  `ButtonBase`, and every button built on it, takes `as` (`'button' | 'div'`) instead of `elementType` to pick its element.

  Sizes use one scale: `Fab` and `FabMenu` take `size="md"` and `size="lg"` (were `medium` and `large`), and `ListItemVideo` takes `sm` and `lg` (were `small` and `large`).

  `useToolbarScrollExpansion` and `useToolbarScrollExit` take `defaultExpanded` and `defaultVisible` instead of `initialExpanded` and `initialVisible`.

  `classNames` slots use one name per part: `List`'s `supporting` is `supportingText`, `BottomSheet`'s and `SideSheet`'s `closeButton` slot is `close`, and `SideSheet`'s `backButton` is `back`.

  Every component with an element of its own takes `className`, `style`, `ref` and `id`: a field's `id` reaches its input or trigger (`Select`, `Autocomplete`, `DateField`), so a `<label for>` or an error summary can point at it, and `Slider`, `RangeSlider`, `DatePicker`, `DateRangePicker`, `TimePicker`, `List`, `Carousel` and `SearchBar` put it on their root. `Tooltip`, `RichTooltip`, `TimePickerModeToggle`, `PickerDialog`, `ListItemAvatar`, `ListItemImage`, `ListItemVideo` and `TouchTarget` take `style` and `ref`, and `Menu`'s `ref` reaches its menu list. Every component's root also takes its element's DOM attributes (`data-*`, `aria-*`, `title`, `lang`, pointer and mouse events…); where React Aria labels an inner element, such as a field's input, the naming attributes, the attributes that describe that element (`aria-controls`, `aria-expanded`, `aria-haspopup`, `aria-autocomplete`, `aria-activedescendant`, `aria-required`, `aria-invalid`, `aria-readonly`, `aria-multiline`, `aria-placeholder`, and `aria-description`, `aria-roledescription` and the braille labels) and the focus, key and input events go there instead, never on a wrapping `div` or `label`. `Select`, `Autocomplete` and `DateField` read a form library's `aria-invalid`, `aria-required` and `aria-readonly` as their `invalid`, `required` and `readOnly`, and `DateField` and `SearchBar` add an app's `aria-describedby` to their inputs. `splitRootProps` (with `{ wrapper: true }` for a root that wraps the labelled element), its `RootDOMProps`, `WrapperRootDOMProps` and `DescriptionAria` types and `pickWidgetAria` (from `@windmorph/react/primitives`) split the props the same way for a component of your own.

  `SnackbarHost`'s `focusShortcut` defaults to `F6` (was `Alt+G`), the key React Aria's toasts take: while a snackbar with a control shows, F6 moves focus to it from anywhere on the page.

  `Button` and `IconButton` take `pending` for an action that takes a moment (a save, a form submit, a refresh): after 200ms a loading indicator in the content colour replaces the content, the button keeps its size, its colours and keyboard focus, presses are blocked and a submit button doesn't submit again. The accessible name gains `labels.pending` (default "Loading"), and a focused button announces it. `pendingIndicator` replaces the indicator (a `CircularProgressIndicator` for a longer wait), and `classNames.pendingIndicator` styles its slot. Toggle buttons have no pending state. `ButtonBase` takes `pending` too (`ButtonBasePendingProps`).

  A `ThemeScope`, and the wrapper an overlay (menu, dialog, tooltip, sheet) is portalled in, carries only the theme attributes that differ from the theme around it, so an app's own `:root` values for the system tokens reach the page's menus and dialogs, and the parts of a scope it doesn't re-theme. A scope that changes the theme, mode or contrast still sets that theme's colours on its own element: write `:root, [data-theme]` (and `:root, [data-motion]` for motion) for a value that holds there too.

  `springProgressWithVelocity` and `springWithVelocityToLinearEasing`, the springs that continue a gesture at its speed, are exported from `@windmorph/react/primitives` and no longer from the main entry.

  A field's server-rendered `aria-describedby` names only the supporting text and error it renders, so assistive technology reading the page before hydration never follows it to a missing element.

  Switching a date picker between the calendar and the text input fades the outgoing view out as it slides away, as the incoming one comes in, instead of dropping it in the first frame.

  `ThemeProvider` stores the selection (in the `windmorph-theme` cookie by default) only once it changes from the one the page loaded with, so a visitor who never picks a setting gets no cookie, and a stored selection isn't rewritten on every visit.
