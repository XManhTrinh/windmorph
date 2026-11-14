# @windmorph/react

All notable changes to `@windmorph/react`, newest first. Each version is grouped by kind (Added, Changed, Deprecated, Removed, Fixed, Security), and each entry links to its pull request. The [What's new](https://windmorph.dev/whats-new) page tells the same story in plain words.

## 0.2.7 — 2026-11-14

### Fixed

- In a scrolling `ChipSet`, the arrow keys bring the whole of a chip with a remove button into view, its focus indicator included. Only the button that took focus was revealed, so the chip's other end could stay past the row's edge. ([#77](https://github.com/XManhTrinh/windmorph/pull/77))
- A `ChipSet` with `disabled` disables every chip in it. It reached only the filter chips that take part in a selection, so with the default `selectionMode="none"` the group announced itself disabled (`aria-disabled`) while every chip still worked. In a set with a selection, the assist, suggestion and input chips, and filter chips without a `value`, stayed enabled; they are disabled now too, and a chip cannot opt out, so keep one that must stay usable, such as a chip that clears the filters, outside the set. A set inside a disabled set is disabled as well. A chip's own `disabled` still works in a set that isn't disabled. ([#74](https://github.com/XManhTrinh/windmorph/pull/74))
- `ChipSet` calls `onSelectionChange` only when the selection changes. A press on the last selected chip of a set with `deselectable={false}` reported the selection it already had. ([#76](https://github.com/XManhTrinh/windmorph/pull/76))
- Enter on a day in a date picker dialog saves that day. The day was picked only when the key was let go, after the dialog had already saved, so a `PickerDialog` with `onConfirm` around a `DatePicker` or a `DateRangePicker`, and a `DateField`'s full-screen dialog, closed with the date picked before. The Enter that saves now picks the day as the key goes down. ([#77](https://github.com/XManhTrinh/windmorph/pull/77))
- A `FilterChip` keeps its selection and keyboard focus when `onRemove` is added or taken away, as an app does to show the remove button only on wider windows. The chip is one button without `onRemove` and a container of two with it, so the toggle was built anew: an uncontrolled chip went back to unselected, and focus fell to the page. ([#76](https://github.com/XManhTrinh/windmorph/pull/76))
- Enter or Space held long enough to repeat acts once in three places. On a time picker's dial, picking an hour moves focus to the minutes, where the repeat picked a minute too and moved the time to the nearest five; in a search bar, the repeat of the Enter that opened the view submitted the query as it stood; on a bottom sheet's drag handle, it went on to the next size and closed a modal sheet it had just opened fully. ([#77](https://github.com/XManhTrinh/windmorph/pull/77))
- An `InputChip` with only `onPress` shows its hover, focus and pressed states, darkens its border under keyboard focus, and keeps a pressed layer while a menu opened from it is open. The chip is a container round its action's button, which alone took those states, so the chip showed none of them. ([#77](https://github.com/XManhTrinh/windmorph/pull/77))
- Under reduced motion an outlined field's border changes width at once when the field takes or loses focus, and only its colour fades. The width kept its transition. ([#76](https://github.com/XManhTrinh/windmorph/pull/76))
- An outlined field's floated label sits in the middle of its notch, with 4px of space on each side. The gap in the outline began 1px too far in, and 2px while the field had focus, so the label had 3px before it and 5px after (2px and 6px focused), and the gap moved 1px each time the field took or lost focus. The outline's border now comes out of its padding, so the gap starts 12px from the field's edge at both of the outline's widths (1px, and 2px with focus). It applies to `TextField`, `Select`, `Autocomplete`, `DateField`, `TimeField` and the pickers' text inputs. ([#73](https://github.com/XManhTrinh/windmorph/pull/73))
- Tab inside a dialog opened from a single-select `ButtonGroup` or `ChipSet` stays in the dialog. Focus on a radio button there was taken for focus entering the group, which moved it to the group's selected button, behind the dialog. ([#77](https://github.com/XManhTrinh/windmorph/pull/77))
- Buttons in a dialog, menu or sheet opened from inside a `ButtonGroup`, a toolbar, an app bar or a search bar no longer take that container's button settings (`Overlay` resets `ButtonContext`). A button in a dialog opened from a `ButtonGroup` took the group's size, shape, variant, `disabled` and connected corners, and an icon button in one opened from a toolbar, an app bar or a search bar was `standard` at density 0. They are now as anywhere else on the page: pass `variant="standard"` to an icon button there to keep that look. ([#77](https://github.com/XManhTrinh/windmorph/pull/77))
- Chips and toggle buttons in a dialog, menu or sheet opened from inside a `ChipSet` or a `ButtonGroup` are no longer part of that set. A chip in such a dialog was disabled with the set, and one with a `value` joined the set's selection. ([#76](https://github.com/XManhTrinh/windmorph/pull/76))
- A tooltip in a dialog, menu or sheet opened from an app bar opens above its button again, as anywhere outside a bar. The app bar's setting, tooltips below, reached into the overlay, so the dialog's own close button showed its tooltip below it. ([#77](https://github.com/XManhTrinh/windmorph/pull/77))
- A chip's remove button no longer takes the props of an overlay trigger around the chip. Inside a `MenuTrigger`, a `TooltipTrigger` or a dialog's trigger, a `FilterChip` with `onRemove` and an `InputChip` with `onPress` and `onRemove` gave both their buttons the trigger's `id`, `aria-haspopup` and `aria-expanded`, a press on Remove also opened the overlay, and the overlay was placed against the remove button. The chip's main button alone is the trigger now. An `InputChip` with only `onRemove` has no main button, so a trigger around it no longer opens anything: put the trigger around another element. ([#74](https://github.com/XManhTrinh/windmorph/pull/74))
- A press on the end of the label of a chip with a remove button no longer removes the chip. The remove button's 48px touch target reached 7px over the label of a `FilterChip` with `onRemove` and of an `InputChip` with `onPress` and `onRemove`, and took the presses there from the toggle or the action. In those chips the target now stops where the label ends: it is 41px wide and 48px tall, and still reaches 7px past the chip's end. An `InputChip` with only `onRemove`, whose label takes no presses, keeps its 48px target. ([#74](https://github.com/XManhTrinh/windmorph/pull/74))
- A single-select `ButtonGroup` or `ChipSet` no longer leaves a listener on the document after each press. The listeners kept the group's element in memory after it was gone. ([#77](https://github.com/XManhTrinh/windmorph/pull/77))
- A chip that holds its main button (a `FilterChip` with `onRemove`, an `InputChip` with `onPress`) draws that button's focus indicator round the whole chip, and its remove button's inside the button, so an `overflow-hidden` class on the chip no longer cuts them off. With a remove button, such a chip also keeps its pressed layer while a menu opened from it is open, as a chip that is one button does. ([#76](https://github.com/XManhTrinh/windmorph/pull/76))
- A chip made of two parts puts its props on the right element. A `FilterChip` with `onRemove` sent every `data-*` attribute to its toggle while `className` and `style` went to its container, so a class written for a `data-*` attribute never matched, an app's `data-tokens` was not added to the chip's own, and `hidden`, `inert` or `aria-hidden` left the remove button behind. Those attributes, with `dir`, `lang` and `translate`, and `draggable` with the drag handlers, now go on the container, which also shows the dragged state (`dragged`, or `data-dragged`) that only the toggle carried; `ref`, `id`, the handlers and every other attribute stay on the toggle, which is still the chip's button. An `InputChip` with `onPress` puts the attributes that name or describe a control (`aria-label`, `aria-describedby`, `aria-expanded`, `aria-controls` …) on its action's button instead of its container, which has no role, so they did nothing there; a container given a `role` keeps them. ([#74](https://github.com/XManhTrinh/windmorph/pull/74))

## 0.2.6 — 2026-11-13

### Changed

- A wrapping `ChipSet` puts 16px between its rows instead of 8px (20px and 24px as `density` makes the chips smaller), so rows are 48px apart and every chip takes presses over its full 48px touch target. At 8px the targets of two rows overlapped and the row below took the space between them, which left a chip with another under it 40px. Chips in a row stay 8px apart, and a scrolling set is unchanged. To keep rows closer, pass a `gap-y-*` class in `className`. ([#70](https://github.com/XManhTrinh/windmorph/pull/70))

### Fixed

- Leaving a scrolling `ChipSet` with Tab no longer scrolls its row to the far end. Tab goes on from the set's last chip (its first with Shift), which took focus on the way and was scrolled into view. ([#71](https://github.com/XManhTrinh/windmorph/pull/71))
- TimePicker's dial numbers are named with the number as shown ("05 minutes of 60", "00 hours of 24"), so each name holds its visible text (WCAG 2.5.3). `labels.dialValue` now receives the number as the dial shows it. ([#61](https://github.com/XManhTrinh/windmorph/pull/61))
- `useScrollKeys` and `useScrollRestoration` (`@windmorph/react/primitives`) follow the element behind their ref when it arrives after the first render, is left out on some pages or is replaced, while the component that calls them stays mounted (a frame that lays some pages out without its pane). `useScrollKeys` took the element once, so the scroll keys kept going to an element no longer on the page and the tab stop was watched on it; `useScrollRestoration` didn't note a page shown without the element, so going back from such a page left the pane at its top. ([#69](https://github.com/XManhTrinh/windmorph/pull/69))
- `useScrollKeys` leaves the scroll keys with another scrolling element the person last pressed in, such as a side sheet's content beside the pane. Browsers scroll that element while nothing has focus, and the pane used to take the keys from it. The returned `tabIndex` now counts only what Tab would reach: a hidden input, or a control in an `inert`, `hidden` or disabled part, no longer takes the tab stop away from a page that is otherwise text. ([#71](https://github.com/XManhTrinh/windmorph/pull/71))
- `useScrollRestoration` keeps a page's position through a slow return to it. Going back or forward again, or pressing a link, while the page was still too short to reach its position replaced what was kept with where the page had got to; a key that repeats after the back shortcut ended the hold; and a change of `holdFor` or `storageKey` after the person had scrolled pulled the page back. A reload now restores only the page the document was loaded with, not the first page of a hook that mounts later, and a restored position is held on an element that arrives after the page has changed. ([#71](https://github.com/XManhTrinh/windmorph/pull/71))

## 0.2.5 — 2026-11-12

### Added

- `LocaleProvider`, which sets the locale of every component below it once: how dates, times and numbers are written (the order of a date, the 12- or 24-hour clock, digits, the first day of the week) and the direction the arrow keys follow. Without it the components still use the browser's language (`en-US` on the server), so an English page in a British browser got 24-hour time fields and `DD/MM/YYYY`; an app whose pages have a language of their own had to import React Aria's `I18nProvider` itself. Pass the page's language, the same on the server and in the browser: `<LocaleProvider locale="en-US">`. A provider inside another sets it for its part of the page. `useLocale` returns the locale and its direction, for an app's own formatting. ([#64](https://github.com/XManhTrinh/windmorph/pull/64))

### Fixed

- A `DateField`, and the date pickers' text input, write their text again when the locale changes. Before, the text kept the old locale's format while the field read it in the new one's order. A server-rendered field with a value changes locale by itself without a `LocaleProvider`, from the server's `en-US` to the browser's language, so 5 March, shown as `03/05/2030`, became 3 May when the field lost focus in a day-first browser. ([#64](https://github.com/XManhTrinh/windmorph/pull/64))
- `Dialog` no longer takes `isEntering`, an option React Aria 3.53 added to the type its props extend. The dialog runs its own entrance, so the prop did nothing; apps that install React Aria 3.53 saw it in the editor. ([#63](https://github.com/XManhTrinh/windmorph/pull/63))

## 0.2.4 — 2026-11-12

### Added

- `LabelsProvider`, one place for the words components show or announce by themselves ("Close", "Error", "Character count: 0 of 160"), so an app in another language writes them once instead of passing `labels` to every instance. Its `labels` are keyed by component (the `WindmorphLabels` type, such as `TextField`, `DialogHeader`, `Button`); a component uses its English default, then the provider's word, then its own `labels`, which still wins, and nested providers merge word by word. `useLabels` in `@windmorph/react/primitives` reads the provider from a component of your own. The `CarouselLabels` type is exported too. ([#55](https://github.com/XManhTrinh/windmorph/pull/55))
- `useScrollRestoration` and `useScrollKeys` in `@windmorph/react/primitives`, for a page that is a pane scrolling by itself, as in the app frame block. `useScrollRestoration(ref, { pageKey })` brings the pane's scroll position back on back, forward and reload, which browsers do only for the window, and starts a new page at its top; it works with any router, which passes its path and query as `pageKey`. `useScrollKeys(ref)` sends Page Down, End, Space and the arrows to the pane while nothing has focus, and returns the `tabIndex` for it: a tab stop only on a page with nothing of its own that takes focus. ([#50](https://github.com/XManhTrinh/windmorph/pull/50))
- `TimeField` takes `presentation="docked"`: on windows 600px wide or more, its clock opens a list of times under the field instead of the dialog, for forms with many times. The list holds every `step` minutes (a new prop, 30 by default) within `min` and `max`, opens on the field's time, and a press or Enter picks a time and closes it; any other time can still be typed, and narrower windows keep the dialog. `classNames.list` and `classNames.option` style it. The dialog stays the default. ([#57](https://github.com/XManhTrinh/windmorph/pull/57))

### Fixed

- A selected `Menu` item's tick, leading icon, description and trailing icon follow the selected label's token (`--md-comp-menus-standard-menu-item-selected-label-text-color`), in `Select`'s and `Autocomplete`'s option lists too. They were a fixed colour, so an app that set the selected tokens got its label colour and a tick in the old one, which could be invisible against the new container. ([#52](https://github.com/XManhTrinh/windmorph/pull/52))

## 0.2.3 — 2026-11-11

### Added

- `href`, `target`, `rel` and `download` on `MenuItem`, which make the item a real link with the item's look, role and keys. A press, Enter or Space follows it and closes the menu, a modified click or the browser's link menu opens it in a new tab or copies its address, and inside a `RouterProvider` a plain click goes through the app's router. A disabled item, or one that opens a submenu, isn't a link. ([#41](https://github.com/XManhTrinh/windmorph/pull/41))

### Fixed

- Pressing an `IconButton`, `Button` or any other pressable component no longer upsets a transition the app adds through `className`, such as a width that grows. While the press's ripple ran, that transition took the ripple's 150ms spring instead of its own duration and easing, and a press while it was still running made it jump to its end. ([#40](https://github.com/XManhTrinh/windmorph/pull/40))
- Content in a `NavigationRail`'s `header` keeps its own size. An image avatar, or any box showing an image at its full size, grew to the image's natural width (a 512px logo covered the whole rail), since the header gave every child `min-width: max-content`. An extended FAB, or an app's name, there still keeps its full width on one line. ([#40](https://github.com/XManhTrinh/windmorph/pull/40))
- A `SearchField` or `SearchBar` hint longer than the field, or a query while the field isn't focused, ends in an ellipsis instead of being cut off mid-letter, as a text field's label does. A searchable `Select`'s search, which draws the same pill, does too. ([#40](https://github.com/XManhTrinh/windmorph/pull/40))
- A `Slider` or `RangeSlider` named with `aria-labelledby` names each thumb by that label, as it names the slider. Its thumb used to be read as its value ("0%"), or a range's thumbs by each other's names, so a screen reader never said the label and `getByRole('slider', { name })` couldn't find it. ([#40](https://github.com/XManhTrinh/windmorph/pull/40))
- A `TextField` or `Autocomplete` hint longer than the field, or a value while the field isn't focused, ends in an ellipsis instead of being cut off mid-letter, as the label, `Select`'s value and the search fields do. ([#44](https://github.com/XManhTrinh/windmorph/pull/44))

## 0.2.2 — 2026-11-10

### Added

- `SearchField`, a search box that filters content in place (a settings page, a table, a list pane), drawn as the search bar's 56px pill and filling its container. It never opens a search view: Escape clears the query, Enter calls `onSubmit`, and a clear button (`labels.clear`, `clearIcon`) shows while there's text. It takes `density` like the other fields (56px down to 44px), and reads the search bar's tokens, so a theme or scoped override restyles both. `SearchBar` and a searchable `Select` now draw the same pill, with no visual change. ([#34](https://github.com/XManhTrinh/windmorph/pull/34))

### Fixed

- A carousel item's focus ring is drawn inside the item, as on a full-bleed carousel, so the first and last items' rings are no longer cut off by the carousel's edges. ([#35](https://github.com/XManhTrinh/windmorph/pull/35))
- A switch `ListItem` that's on no longer fills with the selected colours: it stays plain, as a settings row, with only its switch showing the state, and the whole row is still the control. Checkbox and radio items keep the fill. `selectedWhenChecked` picks either look per item, and the selected item's text and icon colours are now tokens (`--md-comp-list-list-item-selected-*-color`). ([#37](https://github.com/XManhTrinh/windmorph/pull/37))
- A growing `TextField` (`multiline` with `autoGrow`) first rendered out of sight, as in a closed tab or panel, keeps its height once it shows instead of collapsing to 0px, and a `DateRangePicker` rendered out of sight opens on the range's month once it shows instead of the first month of its year range. ([#35](https://github.com/XManhTrinh/windmorph/pull/35))
- An expanded `NavigationRail` sizes itself to its labels exactly. A label that only just fit no longer wraps, the rail measures again once the page's fonts load and once a rail hidden by CSS (shown only on wider windows) comes into sight, and a rail that starts expanded is at its width from the first paint instead of springing open. ([#35](https://github.com/XManhTrinh/windmorph/pull/35))
- A collapsed `FloatingToolbar` or `DockedToolbar` by the window's edge no longer scrolls the page sideways: its hidden leading or trailing content is clipped on the toolbar's axis instead of only hidden. ([#35](https://github.com/XManhTrinh/windmorph/pull/35))

## 0.2.1 — 2026-11-10

### Added

- `closeIcon` on `DialogHeader`, to replace the full-screen close button's icon, as `SideSheet` and `BottomSheet` take. ([#31](https://github.com/XManhTrinh/windmorph/pull/31))
- `classNames.frame` on a standard `SideSheet`, the box that holds a detached sheet's margins, so an app can change the gap on one side. ([#28](https://github.com/XManhTrinh/windmorph/pull/28))

### Fixed

- A disabled `Button` or `IconButton` link keeps `role="link"` once its `href` is gone, so assistive technology can still read its name. ([#28](https://github.com/XManhTrinh/windmorph/pull/28))
- A current `NavigationRail` or `NavigationBar` label keeps its regular weight, as M3 Expressive specifies, and only its colour changes. ([#28](https://github.com/XManhTrinh/windmorph/pull/28))
- Changing the theme, mode or contrast through `ThemeProvider` updates every control at once, where buttons and other controls used to fade behind the page. ([#30](https://github.com/XManhTrinh/windmorph/pull/30))

## 0.2.0 — 2026-11-09

### Added

- `fullWidth` on `ButtonGroup`. A connected group still spans its container by default; `fullWidth={false}` sizes it to its buttons. ([#24](https://github.com/XManhTrinh/windmorph/pull/24))
- `hideOnCollapse="compact"` on `NavigationRail`, so one rail serves as the rail on larger windows and the drawer on a phone, and `useNavigationRail()` for custom destinations. ([#24](https://github.com/XManhTrinh/windmorph/pull/24))
- `TimeField`, the time sibling of `DateField`, which reads forgiving typing and paste and opens the `TimePicker` in a dialog. `Time` and `parseTime` are now exported, so an app needs no date library of its own. ([#24](https://github.com/XManhTrinh/windmorph/pull/24))
- `useRevealEntering`, `toAriaPlacement` and `closedByOverlayOptions` in `@windmorph/react/primitives`, for building anchored overlays that behave as `Menu` does. ([#24](https://github.com/XManhTrinh/windmorph/pull/24))

### Fixed

- `DialogContent` no longer clips the floated label of an outlined field placed first in a dialog. ([#24](https://github.com/XManhTrinh/windmorph/pull/24))
- A selected `NavigationRailItem` or `NavigationBarItem` keeps an explicit `aria-current`, for a destination that shows as current without being the page. ([#24](https://github.com/XManhTrinh/windmorph/pull/24))
- A searchable `Select`'s sheet keeps its search at the top while the options scroll under it. ([#24](https://github.com/XManhTrinh/windmorph/pull/24))
- A `TextField` with `type` `date`, `time`, `datetime-local`, `month` or `week` floats its label while empty, so it no longer covers the format the browser draws. ([#24](https://github.com/XManhTrinh/windmorph/pull/24))

## 0.1.2 — 2026-11-07

### Added

- In development, `ThemeProvider` warns when it hydrates with the server's theme while streamed content is still arriving, then applies a different saved selection, which makes React render that content on the client. The warning names the values and the fix: read the cookie with `getThemeFromCookies` and pass every value as a `default*` prop. ([#18](https://github.com/XManhTrinh/windmorph/pull/18))

### Fixed

- `ThemeProvider` no longer makes React discard server HTML streamed behind a Suspense boundary (a Next.js `loading.tsx`) on a dark device with `mode="system"`; `useTheme()` now resolves `resolvedMode` itself, and the API is unchanged. ([#12](https://github.com/XManhTrinh/windmorph/pull/12))
- Date pickers: a selected day that is also today shows the selected day's on-primary text instead of today's primary text, which couldn't be read on the primary fill (modal and docked); the same for the current year and the ends of a range. ([#14](https://github.com/XManhTrinh/windmorph/pull/14))
- Bottom sheets stay above an on-screen keyboard and within what it leaves showing, and a searchable `Select`'s sheet keeps its full height as the search filters, so its results are never hidden behind the keyboard. ([#16](https://github.com/XManhTrinh/windmorph/pull/16))

## 0.1.1 — 2026-10-28

### Changed

- Published from GitHub Actions with npm provenance, so the package on npm links to the commit and build it came from. No code changes from 0.1.0. ([#10](https://github.com/XManhTrinh/windmorph/pull/10))

## 0.1.0 — 2026-10-27

### Added

- The first release: Material 3 Expressive components for React, with themes, component tokens, the Expressive motion system and shapes, and Next.js support. See [What's new in 0.1.0](https://windmorph.dev/whats-new#v0-1-0) for everything it includes.
