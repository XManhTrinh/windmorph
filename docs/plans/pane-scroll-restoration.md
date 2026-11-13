# Scroll restoration for a pane that scrolls by itself

Status: **built** (2026-11-11), with `useScrollKeys` exported too (the open question below, answered yes).

## The problem

In the app frame block the page is a pane that scrolls inside itself (`overflow-y: auto`), so its rounded corners stay put. Browsers restore only the window's scroll position. In an app with client-side routing on such a frame:

- Going back to a long page lands at its top, or wherever the pane was on the page just left.
- A reload loses the position too.

Reproduced with a minimal client-routed page (2026-11-11): page A scrolled to 3000px, a link to page B, B scrolled to 1200px, then Back: the pane is at 1200px on page A. After a reload it is at 0.

## Decisions

| # | Decision | Value |
|---|---|---|
| 1 | What | A hook, `useScrollRestoration(ref, options)`, that keeps and restores the scroll position of one scrolling element per page |
| 2 | Where | `@windmorph/react/primitives`, beside `useKeepPressedInPlace`: it is behaviour for building on, not an M3 component, and the block's own code imports it, so apps that copy the block get it too |
| 3 | Router | None. The app passes `pageKey`, its router's path and query, so it works with any router (in Next.js: `usePathname()` and `useSearchParams()`) |
| 4 | Keyed by page, not by history entry | Positions are kept per `pageKey`. A router can scroll the pane to the new page's top before the address changes, which would overwrite the old page's position if it were read from `location` at that moment |
| 5 | When a page's position is taken | When the person sets off: a `pointerdown`, a `keydown`, or back and forward. Never from a scroll event after the page has changed |
| 6 | Back and forward | The Navigation API's `navigate` event with `navigationType: 'traverse'` and not `hashChange`, because `popstate` can arrive after the restored page is already on screen. Where the Navigation API is missing, `popstate` in the capture phase |
| 7 | Restoring | On a traverse, and on the first render after a reload, the pane goes to the page's kept position and holds it for about 1.5 seconds while content arrives (images, data), re-applying it as the content's height changes. The hold ends the moment the person scrolls: `wheel`, `touchstart`, `pointerdown`, `keydown` |
| 8 | A new page | Starts at its top. The hook sets it, so the block needs no scroll reset of its own |
| 9 | Storage | `sessionStorage`, so a reload restores and a new tab starts clean. Wrapped in try/catch: with storage blocked it keeps positions in memory for the visit |
| 10 | Server rendering | Effects only; nothing reads `window` at module load or during render |

## API

```tsx
import { useScrollRestoration } from '@windmorph/react/primitives';

const pane = useRef<HTMLElement>(null);
useScrollRestoration(pane, { pageKey: `${pathname}?${searchParams}` });

<main ref={pane} className="overflow-y-auto">…</main>
```

| Option | Type | Default | |
|---|---|---|---|
| `pageKey` | `string` | required | Identifies the page shown: the router's path and query |
| `storageKey` | `string` | `"windmorph-scroll"` | The `sessionStorage` key, for an app with more than one such pane |
| `holdFor` | `number` | `1500` | How long, in ms, a restored position is held while content arrives |

It returns nothing. The first argument is the scrolling element's ref.

## The block

- The three variations whose pane scrolls (app, full, pinned) call the hook on their pane.
- `pinned` has pages of its own in the demo, so it passes its page as `pageKey`. `app` and `full` are one page: they pass a constant with a comment saying to pass the router's path and query.
- The block's page gains a short section, "Scroll position", with the Next.js usage.

## Checks

- Unit (Vitest, jsdom): a position is taken at `pointerdown`, `keydown` and traverse, not after the key changes; a traverse restores and a new page starts at the top; the hold re-applies as the height changes and ends on `wheel`, `touchstart`, `pointerdown`, `keydown`; the `popstate` fallback when `window.navigation` is missing; storage blocked.
- Browser (the Next.js playground, App Router, a route with a pane that scrolls): scroll the pane, follow a link, then Back, Forward and reload: the pane is where it was each time; a new page starts at its top.
- The block spec: `pinned` keeps each page's position as its pages change.
- Docs: the Primitives reference page lists the hook; a changeset (`Added:`).

## As built

- **`useScrollKeys(ref)` is exported too**, from the same entry: the block's listener, so apps import it instead of copying it. It returns the `tabIndex` for the element: `0` while it holds nothing that takes focus, `-1` otherwise (always `-1` fails axe's `scrollable-region-focusable` on a text-only page).
- **The docs site may import the two hooks from `/primitives`**: its lint rule let through only the shape outlines; the app frame blocks import these as an app would.
- **A hold re-applies the position on every frame** it has moved, not only when the content's height changes, so a router's own scroll after the page change is undone too.
- **Nothing kept for a page** (first seen through history): it starts at its top, with no hold.
- **A held key that repeats** after back or forward has begun doesn't count as setting off anew.
- **At most 200 pages** are kept; the oldest go first.
- **Both hooks follow the element behind the ref** (2026-11-12): it can arrive after the first render, be left out on some pages or be replaced while the component that calls the hooks stays mounted, as in a frame that lays its public pages out without the pane. `useScrollKeys` took the element once, in its first effect: after such a swap the scroll keys went to an element no longer on the page (focusing it does nothing), and the tab stop was watched on it. It now reads `ref.current` as each key goes down, and moves the tab-stop watch to the new element after every render of its component and at each key, which also covers a child that swaps the element without the caller rendering. `useScrollRestoration` returned before noting the page when the element was missing, so going back from a page without the pane was read as the same page again and the pane stayed at its top, and the first page with the pane after a reload on a page without it was restored as if it were the reloaded one; the page is now noted first. The playground's `plain` page, laid out without the pane, checks both in the browser.
- **Hardened before 0.2.6** (2026-11-12 and 13, four rounds of review). Each change of behaviour has a test that failed first, and the rest of what was added is pinned by tests too:
  - `useScrollKeys` leaves the keys with another scrolling element the person last pressed in. A browser scrolls that element while nothing has focus (checked in Chromium: a press on a side panel's text, then Page Down, scrolled the panel), and the pane took the keys from it. The element must be on screen (rendered, visible, not `inert`, inside the window) and have more than 1px to scroll, so a sheet since closed or a sideways scroller doesn't keep them. The pressed node is held weakly.
  - Its tab stop uses the library's `tabbables` rule (`isTabbable` in `utils/focus.ts`) instead of a selector of its own, so a hidden input, or a control in an `inert`, `hidden` or disabled part, doesn't take the stop from a text page, and a `summary` or an embedded frame does. Only what is inside the pane counts: a modal overlay makes everything around itself `inert` while it is open, which says nothing about the pane's content. It is read again, at most once a frame, on the attributes that make a control focusable or hide it; `class` and `style` are left out, since animated content writes them on every frame.
  - A hold reads the ref on every frame, so an element that arrives during it (a pane a render late, or below a Suspense boundary) is restored, and one that replaces the first is held.
  - What is kept for a page stands while its restored position is being held, and after a hold that ended short of that position (content still arriving) until the element has moved from where the hold left it, which is the person scrolling. An element that arrives only after the hold counts as short too, at its top. A second step back (from the toolbar, the shortcut or a button in the page), a press on a link, or leaving the page, on a page still too short, wrote the short position over the kept one.
  - A repeating shortcut key (the back shortcut still held) doesn't end a hold, as it doesn't count as setting off; a scroll key held down does. A hold that has ended isn't begun again when the effect runs again for the same page.
  - A reload restores only the page the document was loaded with: the history entry is compared where the Navigation API gives it (`navigation.activation`), the address elsewhere. A hook mounted later in the same document restored its first page as if it were the reloaded one.
  - **Tried and taken back:** counting the back and forward steps begun, for two steps that begin before the first page shows. It left a step behind whenever the router commits the two as one page (the usual case with transitions), which then restored a later page that should have started at its top, and a key press between the steps reset it anyway. The flag stays: in that rare order the second page starts at its top.
  - **Not changed, for a later plan if wanted:** every change of `pageKey` that isn't back or forward starts at its top, so a query that changes in place (a filter, a sort) does too when the query is part of the key; the hook sees back and forward only while mounted, so it belongs in a layout; one storage key holds one set of pages; after a hold that ended short, any move of the element is taken for the person's (content that shrinks for a moment, an element replaced), as it always was; the keys are taken in the capture phase, before an app's own handler can cancel them; without the Navigation API a step back within the page (a fragment) still counts as a step to another page until the next press or key (undoing it on `hashchange` was tried, and stopped apps that route by fragment restoring at all).
- **The browser check** is the Next.js playground's `/scroll-pane/[page]` (App Router): back, forward and reload, a new page at its top, the hold letting go on a wheel. Without the hook it fails (Back leaves the pane where the other page was).
