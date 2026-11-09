# @windmorph/react

All notable changes to `@windmorph/react`, newest first. Each version is grouped by kind (Added, Changed, Deprecated, Removed, Fixed, Security), and each entry links to its pull request. The [What's new](https://windmorph.dev/whats-new) page tells the same story in plain words.

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
