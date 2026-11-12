# @windmorph/react

All notable changes to `@windmorph/react`, newest first. Each version is grouped by kind (Added, Changed, Deprecated, Removed, Fixed, Security), and each entry links to its pull request. The [What's new](https://windmorph.dev/whats-new) page tells the same story in plain words.

## 0.3.0 — 2026-11-12

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
