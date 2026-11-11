# Scroll restoration for a pane that scrolls by itself

Status: **plan, waiting for approval** (2026-11-11). Nothing is built.

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

## Open question

The scroll keys' listener in the block (2026-11-11) could be a second export, `useScrollKeys(ref)`, so apps import it instead of copying about 25 lines per frame. Recommended: yes, in the same change, since both exist for the same pane.
