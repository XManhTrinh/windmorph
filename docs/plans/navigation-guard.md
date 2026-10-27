# Plan: navigation guard (`@windmorph/react/next`)

Status: **approved on 2026-10-10 and built**

## Goal

Let a page with unsaved changes ask before the person leaves it: "Discard your changes?" when they follow a link, and the browser's own prompt when they reload or close the tab. An app's settings forms are the first consumer, and any long form (a listing, a job post, a business profile) needs the same.

Today `NextRouterProvider` sends every library link (`href` on a `Button`, `IconButton`, `ListItem`, `MenuItem`, `Tab`, `Link`, …) straight to `router.push`, so nothing can stop it. The guard adds one check in that path. It isn't a component and adds no UI: the page shows its own confirm `Dialog`, in its own words and language.

## Decisions

| # | Decision | Value |
|---|---|---|
| 1 | Where | `packages/react/src/next/navigation-guard.tsx`, exported from `@windmorph/react/next` next to `NextRouterProvider` |
| 2 | API | A hook, `useNavigationGuard({ when, onAttempt })`. While `when` is true, a library link doesn't navigate; `onAttempt(proceed)` runs instead, and the page calls `proceed()` if the person confirms. Several guards can be active; the most recent one decides |
| 3 | Reload and closing the tab | While `when` is true, the hook also asks the browser to confirm (`beforeunload`). Browsers show their own wording there, which no page can change |
| 4 | Navigating in code | `useGuardedNavigate()` returns a `navigate(href)` that goes through the same check, for code that would call `router.push` itself (a Save-and-continue button, a redirect after an action) |
| 5 | Where it applies | Every library link inside `NextRouterProvider`, and `useGuardedNavigate`. Not plain `<a>` or `next/link` elements outside the library, and not the browser's Back and Forward buttons, which the App Router gives no way to stop; reloading and closing still ask (decision 3). The docs say so |
| 6 | No provider change for consumers | `NextRouterProvider` keeps its props; it now holds the guards in a context. A guard outside a `NextRouterProvider` only covers reload and close |
| 7 | Server rendering | Client only (`"use client"`); nothing at module load touches `window` |

## API

```tsx
import { useNavigationGuard } from '@windmorph/react/next';

const [leaving, setLeaving] = useState<(() => void) | null>(null);
useNavigationGuard({ when: dirty, onAttempt: (proceed) => setLeaving(() => proceed) });

<Dialog open={leaving !== null} onOpenChange={(open) => !open && setLeaving(null)} role="alertdialog">
  <DialogTitle>Discard your changes?</DialogTitle>
  <DialogActions>
    <Button variant="text" onPress={() => setLeaving(null)}>Keep editing</Button>
    <Button variant="text" onPress={() => leaving?.()}>Discard</Button>
  </DialogActions>
</Dialog>
```

## Files

```
packages/react/src/next/navigation-guard.tsx     the context, useNavigationGuard, useGuardedNavigate
packages/react/src/next/NextRouterProvider.tsx   checks the guards before router.push
packages/react/src/next/navigation-guard.test.tsx
apps/site/                                    a "Leaving with unsaved changes" section on the
                                              Next.js guide page, with an example, and the guide's
                                              search summary
.changeset/                                   minor: adds useNavigationGuard and useGuardedNavigate
```

## Tests

- A library link navigates when no guard is active, and calls `onAttempt` instead while one is.
- `proceed()` navigates to the link's `href`; ignoring it stays put.
- The most recent active guard decides; one with `when: false` is skipped; unmounting removes it.
- `beforeunload` is prevented only while `when` is true, and the listener is removed afterwards.
- `useGuardedNavigate` goes through the same check.
- `pnpm typecheck`, `pnpm lint` and `pnpm test` pass.

## Answered

1. **Name:** `useNavigationGuard` (and `useGuardedNavigate`) (2026-10-10).
2. **Back and Forward:** not covered (the App Router can't stop them), with reload and close covered by the browser's prompt (2026-10-10).
