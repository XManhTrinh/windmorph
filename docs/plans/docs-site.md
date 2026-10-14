# Plan: consumer documentation site

Status: **built and merged (fb811be), 2026-10-06**: the docs site is `apps/site`.

## Goal

Give teams consuming `@windmorph/react` a real documentation site: how to install it, theme it, customise it and use every component. Storybook (`apps/docs`) stays the workbench and visual test harness; it is not the consumer docs.

## Decisions

| # | Decision | Value |
|---|---|---|
| 1 | Where the docs live | A **new Next.js App Router app at `apps/site`**, written in MDX (`@next/mdx`). Not `apps/next-playground` (see "Where it's built") |
| 2 | Next.js version | **The latest stable Next.js** (16.3.8 on npm `latest` as of 2026-10-03; re-check with `npm view next version` when scaffolding), with the React 19 version the workspace already uses |
| 3 | Why Next.js | It uses the library the way consumers will (App Router, `next/font`, `NextRouterProvider`, `"use client"` boundaries, pre-rendered pages), so the site doubles as proof of the Next.js support |
| 4 | Output | **Static export** (`output: 'export'`); hosting decided later (any static host: GitHub Pages, Vercel, …). With no server to read cookies, the theme is applied before hydration with `ThemeScript` |
| 5 | Components | **Built only with Windmorph** (see "Only our components") |
| 6 | Props tables | **Generated** from the TSDoc already on every public API (`react-docgen-typescript` at build time), never hand-written, so they can't drift from the code |
| 7 | Examples | Live components rendered on the page, with their source shown next to them (one file per example, imported both as a component and as raw text) |
| 8 | Migration notes | **None.** This is a new library with nothing to migrate from |
| 9 | Components beyond M3 | The docs need a `CodeBlock` and a docs-specific **`PropsTable`** (not a general `DataTable`). They're Windmorph Pro components (`@windmorph/react-pro`). (2026-10-14: the site's props are now its own responsive list built from core components, not `PropsTable`.) |

## Where it's built

A new app, `apps/site`, created with the latest Next.js (`create-next-app` or a hand-written minimal app matching the workspace's TypeScript, ESLint and Tailwind v4 setup), added to the pnpm workspace and Turborepo.

`apps/next-playground` stays as it is. It is a test fixture with a different job:

| | `apps/next-playground` | `apps/site` |
|---|---|---|
| Purpose | Proves the library works in Next.js | Docs for consumers |
| Routers | App Router **and** Pages Router | App Router only |
| Rendering | Per-request server rendering: reads the theme cookie to test the no-flash cookie path | Static export: no server, so `ThemeScript` |
| Size | Deliberately tiny, so its Playwright checks stay fast and failures point at the library | About 50 pages of MDX, examples and generated props tables |

A static export can't read cookies, so merging the two would either drop the playground's cookie-path test or stop the site being static, and a docs change could break the library's compatibility checks. The site copies the playground's setup pattern (`next/font`, `ThemeProvider`, `NextRouterProvider` in the layout); it doesn't import from it.

## Only our components

The site is built **only with Windmorph** (`@windmorph/react` and Windmorph Pro): it is the library's showcase and its first real consumer.

- **Every UI element is a library component:** navigation (navigation rail, flexible navigation bar), the top app bar, search (`SearchBar` / `SearchAppBar`), theme and mode controls (`ButtonGroup`, `Menu`, `Switch`), cards, lists, tabs for example source, chips, dialogs, snackbars, tooltips, buttons and icon buttons.
- **No other UI library** (no shadcn, Radix, Headless UI, docs themes such as Nextra or Fumadocs), and no hand-built widgets that duplicate a library component.
- **Styling** uses only the library's semantic tokens and Tailwind utilities (`bg-surface`, `text-on-surface-variant`, `text-body-large`, `rounded-corner-large`, …). No raw colours, no other fonts besides Roboto Flex, no custom design tokens.
- **Plain content** (headings, paragraphs, inline code, simple tables) is semantic HTML styled with those tokens; MDX elements map to the library's type scale and colour roles.
- **Gaps go into the library, not the site.** Anything the site needs that isn't an M3 component is built in Windmorph Pro with its own tests, axe checks, story and visual coverage, then used by the site. M3 components the library lacks go in `packages/react/src/components` as usual. Nothing is improvised inside `apps/site`. Known Pro components to build first:
  - **`CodeBlock`:** highlighted source for examples and install snippets, with a copy button (an M3 `IconButton`). Highlighting runs at build time (e.g. Shiki produces the markup); colours map to the library's colour roles, so it follows every theme, mode and contrast level.
  - **`PropsTable`:** the generated props tables (name, type, default, description), keyboard-navigable and readable on small screens. Docs-specific on purpose; a general `DataTable` (sorting, selection, pagination) waits until something needs it.
  - **Page index search:** uses the M3 `SearchBar`; the static search index is data, not UI, so it needs no Pro component. As built (2026-10-13):
    - **Layouts:** compact windows open the contained full-screen view from the `SearchAppBar` (a back button closes it); medium and wider dock the results under the top bar's search (360px, 480px from large windows), which the library widens on focus.
    - **Shortcuts:** ⌘K / Ctrl+K anywhere, and `/` outside a field, open the bar on screen (`aria-keyshortcuts`, and a hint in the docked bar for fine pointers). Escape closes it and focus returns to where it was.
    - **Results:** grouped under a heading per category (Guides, then each component group in the order of its best result) as segmented `List`s, each row with a leading icon, the matched text highlighted and a type label (Guide, Gallery, Component, or the API / Accessibility / Guidelines tab a code name or a "slider keyboard" query opens). ↑ / ↓ cross from one group to the next and back up to the field.
    - **Before typing and on no match:** recent searches (kept in local storage, read through `useSyncExternalStore`, removable) and suggested pages; no match also says so and how to search. The view's live region announces the result count (`resultsAnnouncement`).
    - **Fast:** the index is built at export time and lower-cased once on the client; each keystroke compares strings, with no network.
- **Icons:** Material Symbols SVGs passed to components, as the library documents (no icon font).

**Enforcement:** an ESLint `no-restricted-imports` rule on `apps/site` allows UI imports only from `@windmorph/react`, `@windmorph/react/next`, `@windmorph/react-pro`'s entries, React and Next.js, so `pnpm lint` fails if another component source is added.

## Site structure

```
apps/site
  app/
    layout.tsx               ThemeProvider + ThemeScript, Roboto Flex via next/font, NextRouterProvider
    page.tsx                 Home: what the library is, quick start, component gallery
    (docs)/
      layout.tsx             Navigation rail / bar + top app bar with search, theme controls
      getting-started/
      theming/
      motion/
      customisation/
      accessibility/
      nextjs/
      from-compose/          Compose Material 3 composables and parameters → components and props
      spec-status/           Every component's M3 Expressive spec status
      components/[slug]/     One page per component (statically generated), tabs: Overview, API,
                             Accessibility, Guidelines
  content/                   Guides and component pages; components/catalog.ts and spec-data/
  examples/                  One file per live example
  scripts/generate-props.ts  TSDoc → props JSON per component, and hook docs (scripts/hook-docs.ts)
```

Every piece of the layout is a library component (see "Only our components"): navigation rail / flexible navigation bar, top app bar, search bar for the page index, lists, cards, tabs for example source, and a theme / mode / contrast / motion / direction switcher.

## Content

1. **Getting started**
   - Install with Tailwind in Vite and in Next.js (`@import "@windmorph/react/styles.css"`, `@source`), or without Tailwind (`styles.compiled.css`).
   - Loading Roboto Flex (`next/font`, Google Fonts) and the system-font fallback.
   - Icons: passing Material Symbols SVGs as React elements.
   - Client routing: `RouterProvider` / `NextRouterProvider`.
   - Vite 8 `"use client"` warning filter.
2. **Theming**
   - The six themes × light / dark / system × three contrast levels, with a live switcher.
   - `ThemeProvider` (controlled and uncontrolled, storage options), `useTheme`, `ThemeScope`, `useThemeScope`.
   - Custom themes: `createTheme` at runtime and the `windmorph theme` CLI for static CSS.
   - No theme flash: cookie + `getThemeFromCookies()` (recommended) or `ThemeScript`.
   - Overriding tokens in CSS (`--md-sys-*`), globally or per theme.
3. **Motion**
   - The `expressive` and `standard` schemes; spatial and effects springs at three speeds.
   - Tailwind utilities (`ease-m3-*`, `duration-m3-*`), `useM3Spring` / `getM3Spring`.
   - Reduced motion: what changes.
   - The legacy easing and duration tokens, as part of the motion API.
4. **Customisation**
   - The override levels: tokens → theme → restricted theme list → `ThemeScope` → `className` / `classNames`.
   - Extending the exported variant definitions (`buttonStyles`, …) with `tv`.
   - `cn()` and why consumer classes always win.
   - Layout safety: what consumers can put on any component (`fixed`, `overflow-*`, transforms, …) and the few documented exceptions (overlays, scroll-driven app bars).
5. **Accessibility**
   - WCAG 2.2 AA commitments, 48px touch targets, focus rings.
   - Names the types require (icon buttons, toolbars, lists, sliders, …).
   - Keyboard behaviour per component (a summary table, detailed on each component page).
   - RTL and the DOM-direction behaviour (`DomDirectionLocale`).
6. **Next.js**
   - App Router and Pages Router setup, `"use client"` boundaries, server-safe utilities.
   - `@windmorph/react/next` helpers.
7. **From Compose:** Compose Material 3 composables and their key parameters mapped to components and props, generated from the spec data, plus the conventions that carry over (`Modifier` → `className`, `onClick` → `onPress`, …).
8. **Spec status:** every component's status from the spec data, linked to its API tab.
9. **Components** (about 60 pages), each with:
   - What it is for, and when to use something else.
   - A playground with a control for every public prop (tested; the few that can't have one are allowlisted with a reason), whose copied snippet compiles for every control value (`scripts/check-snippets.ts`, part of `typecheck`).
   - Live examples of its variants, sizes and states: one for every variant and configuration in the M3 spec, mapped in its spec data (tested).
   - The generated props table for every exported part (and `classNames` slots), and its hooks as functions (tested against the core's exports).
   - A spec status: what it covers of the M3 Expressive spec, its deliberate differences and its extensions, from its spec data.
   - Keyboard and screen-reader behaviour.
   - Where it differs from Compose, condensed from `docs/architecture.md` §9.
   - Pages: Button, IconButton, ButtonGroup, SplitButton, Fab / ExtendedFab, FabMenu, Card, Chips, TextField, Checkbox, RadioGroup, Switch, Slider / RangeSlider, Dialog, Menu, Tooltip, Snackbar, BottomSheet / SideSheet, NavigationRail, NavigationBar, Tabs, TopAppBar, SearchBar / SearchAppBar, Toolbars, List, Carousel, Badge, Divider, Progress indicators, LoadingIndicator, DatePicker / DateRangePicker, TimePicker, PickerDialog, plus the primitives (`@windmorph/react/primitives`) on one page.

## Build steps

1. **Shell:** create `apps/site` with the latest Next.js, add it to the workspace and Turborepo (`build`, `typecheck`, `lint`, `test:e2e`), static export, MDX, layout with navigation and theme controls, home page.
2. **Pro components and props generation:** build `CodeBlock` and `PropsTable` in Windmorph Pro; `scripts/generate-props.ts` reads the library's TypeScript and writes props JSON per component for `PropsTable`. Runs before `build` / `dev`.
3. **Guide pages:** getting started, theming, motion, customisation, accessibility, Next.js.
4. **Component pages** in batches (actions; inputs and selection; containment and overlays; navigation; feedback and pickers), committing per batch.
5. **Checks:**
   - Playwright smoke test: every page renders, has no console errors, passes axe, and works in RTL and dark mode.
   - A link checker for internal links.
   - The site's build added to CI.
6. **Records:** a decision row in `docs/architecture.md` (§1, §13 repo layout, §14 quality) and a README link.

## Definition of done

- `pnpm build`, `typecheck`, `lint`, `test` and the site's Playwright suite pass.
- Every public component has a page with live examples and a generated props table.
- The site builds to a static export that opens from any static host.

## Open

- Hosting target (static export works anywhere; pick before the first deploy).
- Whether the site gets its own domain and versioned docs once `@windmorph/react` is published.
