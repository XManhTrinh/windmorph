# Plan: SideSheet edge and swipe to dismiss (`@windmorph/react`)

Status: **approved 2026-10-17**. Covers four side sheet gaps found in a review of the content components: `edge`, swipe to dismiss, a `confirmValueChange` callback / a gesture switch, and `sheetMaxWidth`.

## Goal

`SideSheet` (architecture §9 "Sheets") always sits on the window's end edge, and the modal sheet can only be closed with its close button, Escape or a press on the scrim. A review compared it with the sheet APIs elsewhere and found four gaps. This plan decides each one by the M3 spec, the Android implementations and the web's own patterns, using the API names of the 2026-10-17 conventions review (`closedBy`, `start` / `end`, `labels`, no `is*` / `allows*` / `should*`).

| Gap | Decision |
|---|---|
| `edge` | **Add** `edge: 'start' \| 'end'` (default `end`) |
| Swipe to dismiss on the modal sheet | **Add**, on by default, touch and pen only, with `swipeable` to turn it off |
| `confirmValueChange` | **Not added**: the controlled `open` is the veto; a vetoed swipe springs back |
| Gesture enable | **`swipeable`** (also on `BottomSheet`, for the same reason) |
| `sheetMaxWidth` | **Not added**: the spec fixes 400px; `classNames.panel` already overrides it |

## Sources (fetched 2026-10-17)

| Source | What it says |
|---|---|
| m3.material.io, Side sheets, Guidelines | "Place side sheets along the edge of the screen, usually on the right side to avoid interference with any navigational components on the left edge." "In right-to-left (RTL) languages, side sheets should appear on the left edge of the window with all elements reversed." "Modal side sheets … must be dismissed in order to interact with the underlying content." "Side sheets can vertically scroll independent of the rest of the UI." "Side sheets cannot scroll horizontally." Predictive back on Android: "a gesture … allows a person to swipe left or right on the side sheet" |
| m3.material.io, Side sheets, Specs | "Max-width 400dp" for both variants; "Margins (when detached) 16dp" |
| m3.material.io, Side sheets, Accessibility | "Material requires that a close affordance, such as a close icon button, is always present within a side sheet." "The accessibility role for a side sheet is Dialog." |
| m3.material.io, Side sheets, Overview | Implementations: Jetpack Compose "Unavailable", Web "Unavailable", Android Views (MDC-Android) "Available" |
| MDC-Android `docs/components/SideSheet.md` | Modal sheets "can be dragged horizontally and dismissed by sliding them off of the screen"; `app:behavior_draggable` / `setDraggable()`, default true; the edge is a gravity (`setSheetEdge` on the modal dialog), and "setting the edge to `start` or `end` lets the sheet switch sides based on layout direction"; `android:maxWidth` / `setMaxWidth()` |
| Compose `WideNavigationRail.kt` (`ModalWideNavigationRail`, the closest Compose surface that slides in from a side) | Horizontal `anchoredDraggable` with `enabled = gesturesEnabled`, `positionalThreshold = { distance -> distance * 0.5f }`, a fling behaviour from `AnchoredDraggableDefaults`; dismissed by the scrim, the drag and Escape |
| Compose `ModalBottomSheet.kt` | `sheetGesturesEnabled: Boolean = true` ("Whether the bottom sheet can be interacted with by gestures"), `sheetMaxWidth: Dp = BottomSheetDefaults.SheetMaxWidth` (640dp) |
| Compose `SheetDefaults.kt` (`SheetState`) | `confirmValueChange: (SheetValue) -> Boolean = { true }`, "Optional callback invoked to confirm or veto a pending state change"; `show()`, `hide()`, `expand()` and `partialExpand()` all ask it first |
| Material Web | No sheet component (maintenance mode, not a reference, core §1 decision 3) |
| WAI-ARIA APG, Dialog (Modal) | "Escape: Closes the dialog." |
| WCAG 2.2 SC 2.5.7 Dragging Movements | "All functionality that uses a dragging movement for operation can be achieved by a single pointer without dragging, unless dragging is essential …" |
| HTML `<dialog closedby>` | `any` (light dismiss and close requests), `closerequest` (Escape and the platform's back gesture), `none` |

## Decisions

| # | Decision | Value |
|---|---|---|
| 1 | `edge` | `edge?: 'start' \| 'end'`, default `'end'` (the spec's "usually on the right side" in a left-to-right page; in RTL the end edge is the left, as the spec asks). Logical values only, as every core side enum (`placement`, `controlPlacement`) and MDC's `start` / `end` gravities; a physical `left` / `right` would break the RTL rule. `data-edge` on the root is a public styling hook |
| 2 | What `edge` changes, modal | The anchored edge, the slide direction (in from that edge, out past it), the free edge (corners, the forced-colours border, the overshoot bleed on the anchored side, the container's `clip-path`), and the swipe direction. A detached sheet floats 16px from the chosen edge |
| 3 | What `edge` changes, standard | The standard sheet sits in the app's layout, so the app still puts it first or last in its row; `edge` says which of its sides faces the window: the divider (`divider`) goes on the other side, the content edge, and the panel stays aligned to the window edge while the root's width opens and closes from the content side (the 2026-10-15 measured-width mechanism, mirrored) |
| 4 | Swipe to dismiss | On the **modal** sheet only. The standard sheet sits in the layout and is opened and closed by the app, so a swipe that closes it would surprise. Starts anywhere on the panel (header, content, footer), never on the scrim |
| 5 | Which pointers | Touch and pen, as the bottom sheet's content drag (§9 "Dragging from the content"). A mouse drag selects text, as on any page; mouse users have the close button, Escape and the scrim |
| 6 | Vertical scrolling keeps working | The gesture is decided after the 4px slop (`DRAG_SLOP`): a move more vertical than sideways is the browser's (the content scrolls natively, as the spec's "vertically scroll independent of the rest of the UI" needs); a sideways move away from the edge is ignored; a sideways move toward the edge drags the sheet. The first decision holds until the pointer lifts. The panel is `touch-action: pan-y pinch-zoom`, so the browser never takes a horizontal pan from it but still scrolls and zooms |
| 7 | Content that owns horizontal gestures | Left alone: form fields (caret and selection), anything between the target and the panel whose `touch-action` excludes horizontal panning (`none`, `pan-y`: a horizontal `Slider`, a carousel's own drag), and a horizontal scroller that can still scroll in that direction. The core's `ownsGesture` gains an axis (`'x' \| 'y'`), so the bottom sheet's rules and these share one helper |
| 8 | Drag and settle | While dragging, the panel follows the pointer along the inline axis with no transition (`data-dragging`), clamped at its open position (it never pulls away from the edge). On release, `settleTarget` (Compose `AnchoredDraggableState`, already ported) with anchors open / closed: a fling over 125px/s toward the edge closes; otherwise it closes once dragged past **half its width** (Compose's horizontal rail: `distance * 0.5f`; the bottom sheet's 56px suits its taller travel, not a 256–400px sheet), and springs back if not. `settleTarget` takes the positional threshold as a parameter. Velocity is taken from the last 100ms of moves, not from the first point, so a slow drag ending in a flick reads as a fling (the bottom sheet adopts the same helper) |
| 9 | The scrim during a drag | Stays at 32% and fades as the sheet leaves, as the bottom sheet's does |
| 10 | `confirmValueChange` | **Not added.** On the web the controlled `open` is the veto: a swipe past the threshold calls `onOpenChange(false)`; if the app keeps `open` true (unsaved changes, a confirm dialog first), the sheet springs back to its open position on the default spatial spring. One mechanism covers every way of closing (button, Escape, scrim, swipe), which a gesture-only callback would not; Compose needs a callback because its state object animates itself. A dev warning is not needed: the spring-back is the visible result |
| 11 | Turning gestures off | `swipeable?: boolean`, default `true`. A positive adjective as `clearable`, `copyable`, `deselectable` (the 2026-10-17 naming round), never `gesturesEnabled` or `disableSwipe`; not `draggable`, which is an HTML global attribute the root would pass to the DOM. `closedBy="none"` also stops the swipe (it closes only through the app), as it already stops the bottom sheet's drag down to close, while `'any'` and `'closerequest'` keep it, since a swipe is the touch counterpart of the platform's back gesture. **`BottomSheet` takes the same `swipeable`** (Compose's `sheetGesturesEnabled`): `false` stops the handle drag and the content drag, while the handle stays a button |
| 12 | `sheetMaxWidth` | **Not added.** The spec fixes the maximum at 400dp for both variants, and the panel's `max-w-[400px]` is a class, so `classNames.panel` (`max-w-[480px]`, through `cn()`) already lifts it for an app that must break the spec; the docs say so. A prop would advertise going past the spec, and component tokens don't expose sizes (§4) |
| 13 | Escape and dismissal | Unchanged by this plan beyond the rename round's `closedBy: 'any' \| 'closerequest' \| 'none'` (default `'any'` for sheets): Escape closes the modal side sheet (APG), a scrim press closes it with `'any'`, the close button always shows (M3 requires it) |
| 14 | Single-pointer alternative | The swipe is never the only way: the close button (always present) and the scrim are single-pointer alternatives, as WCAG 2.5.7 asks |

## API

```tsx
<SheetTrigger>
  <Button variant="tonal">Filters</Button>
  <SideSheet title="Filters" edge="start">{/* … */}</SideSheet>
</SheetTrigger>

// Veto a swipe (or any close) while there are unsaved changes:
<SideSheet title="Edit details" open={open} onOpenChange={(next) => (next || !dirty ? setOpen(next) : askToDiscard())}>
```

New props (TSDoc-ready):

```ts
/**
 * The window edge the sheet is anchored to: `end` (default; the right in a left-to-right page,
 * the left in RTL, as M3 asks) or `start`. A modal sheet slides in from it and swipes out
 * toward it; a standard sheet puts its divider on the other side.
 * @default "end"
 */
edge?: 'start' | 'end';

/**
 * Whether a touch or pen swipe toward the sheet's edge closes a modal sheet. The close button,
 * Escape and the scrim still close it either way. Ignored by a standard sheet. Off when
 * `closedBy` is `"none"`. To keep the sheet open after a swipe (unsaved changes), control
 * `open` and leave it `true`: the sheet springs back.
 * @default true
 */
swipeable?: boolean;
```

`BottomSheet`: the same `swipeable` ("Whether dragging the handle or the content moves the sheet. The handle stays a button. @default true").

## Behaviour details

- **RTL:** everything is logical. The drag reads the sheet's computed direction (the `Overlay` re-applies `dir`), so "toward the edge" is rightward for `end` in LTR and leftward in RTL, and the reverse for `start`. The back icon keeps its existing mirroring.
- **Focus:** a swipe that closes returns focus where the modal sheet's `FocusScope` returns it (the trigger); a sprung-back swipe leaves focus where it was. The pointer capture taken once dragging cancels the press underneath, as in the bottom sheet, so a swipe that starts on a button never activates it.
- **Density:** unchanged. The header's icon buttons stay at density 0 in their 72px row; the content follows the theme.
- **Text at 200%:** unchanged (the width is px, the content wraps and scrolls vertically).
- **`prefers-reduced-motion`** (§6): the drag still follows the finger (motion that follows the pointer is kept); on release a closing sheet fades out where it is and a returning one snaps back at once; the entry and exit stay fades.

## Motion

- Entry: default spatial spring, from the chosen edge (`translate-x-full` or its mirror). Exit and swipe-close: fast spatial spring to 112% past the edge, as today (the overshoot settles out of view). Spring-back after a short or vetoed swipe: default spatial spring (about 1.5% overshoot in the expressive scheme). Its overshoot carries the panel a few px past its open position, away from its edge, and the existing 32px bleed on the anchored side covers the gap, as it does on entry (§9 "No gap on overshoot").
- The drag offset is a CSS variable (`--m3-side-sheet-offset`) on the library-owned motion layer; the panel and the consumer's container never get a transform (§10 rule 4).

## Tokens

No new tokens: `edge` and swiping add no values. The modal sheet's `--md-comp-sheet-side-docked-modal-container-shape` keeps meaning "the free edge's corners", now on whichever side is free. `scripts/component-tokens.test.ts` and `component-tokens.spec.ts` run with `edge="start"` too.

## Layout safety

- `className` and `style` stay on the container (the outermost element); `edge` only changes which side the container's library-owned layers align to. The modal container is `fixed inset-y-0` plus `start-0` or `end-0`, so a consumer inset still can't stretch the panel.
- The standard sheet's override matrix (`fixed`, `absolute`, `sticky`, `static`, overflow, a transform, a transformed ancestor, RTL) runs for both edges.
- The modal sheet's `clip-path` (which hides the overshoot bleed at rest) is mirrored per edge and direction.

## SSR

`edge` only picks classes and `data-edge`, so the server's HTML is right for the standard sheet; the modal sheet renders only while open, on the client. The gesture listeners attach in effects; nothing reads `window` at module load.

## Accessibility

- Role, name and focus are unchanged (modal: `dialog` with `aria-modal`; standard: non-modal `dialog`).
- The Accessibility tab's sections: **Touch target** adds the swipe and its alternatives; **Keyboard** unchanged (Escape, Tab); **Motion** adds the reduced-motion release; **What you need to do**: keep a single-pointer way to close (built in), and if you veto closing, tell people why (a confirm dialog), since a swipe that silently springs back can feel broken.

## Tests

**Unit (Vitest):**
- `sideSwipeGesture(dx, dy, edge, direction)`: undecided within the slop; vertical → scroll; away from the edge → ignore; toward the edge → drag, for both edges in LTR and RTL.
- `settleTarget` with a positional threshold parameter: 50% of a 320px sheet, a fling over 125px/s, a short slow drag springs back; the bottom sheet's existing cases still pass with 56px.
- `ownsGesture` per axis: a `pan-y` slider owns a horizontal drag but not a vertical one; `none` owns both; a horizontal scroller that can scroll owns the move, one at its end doesn't.
- Recent-velocity helper: a slow drag ending in a flick is a fling.
- `SideSheet`: `edge="start"` puts the root's `data-edge`, the start-anchored container and the end-side corners on; a touch swipe (pointer events with `pointerType: 'touch'`) past half closes and calls `onOpenChange(false)`; a controlled sheet kept open springs back (`data-dragging` cleared, offset 0); `swipeable={false}` and `closedBy="none"` ignore the swipe; a mouse drag never moves it; a swipe starting on a button doesn't press it; the standard sheet ignores `swipeable` and puts its divider on the content side for each edge; axe in every state. `BottomSheet` `swipeable={false}`: the handle drag and content drag do nothing, the handle press still expands.

**e2e (Playwright, CDP touch input as the bottom sheet's specs):**
- Swipe to close for both edges, LTR and RTL, at 390 × 844 and 1280 × 800 with touch; a short swipe springs back; a fling closes.
- A vertical swipe on long content scrolls it (`scrollTop` changes) and the sheet stays put; a horizontal scroller and a horizontal `Slider` inside keep their drags; the page behind never scrolls (scroll lock).
- Reduced motion: the drag follows the finger; release fades out in place (`e2e/reduced-motion.ts` records no intermediate translate after release).
- Scroll guard and forced-colours guard over the new stories; the forced-colours border sits on the free edge for `edge="start"`.
- Screenshots: modal and standard, both edges, LTR and RTL, light / dark / high contrast, detached, forced colours, mid-drag frame; the layout-safety matrix for `edge="start"`.

## Docs site

- **Sheets** page (`content/components/sheets.tsx`): an "Edge" example (`examples/sheets/sheet-side-edge.tsx`: a start-edge filter sheet), a "Swipe to dismiss" paragraph with the veto pattern, the 400px maximum and how `classNames.panel` lifts it, and `swipeable` on both sheets.
- **Playground:** the SideSheet controls still missing (`variant`, `detached`, `title`, `onBack`, `footer`, `footerDivider`, `divider`) plus `edge` and `swipeable`, and `swipeable` on the bottom sheet; `descriptors.test.ts` coverage follows.
- **Accessibility data** (`content/components/accessibility/sheets.ts`): the sections above.
- **Spec data:** "Standard side sheet" and "Modal side sheet" configurations gain the start edge (in spec: "usually on the right side"); swipe to dismiss is listed as an extension beyond the M3 web guidance, following MDC-Android's modal side sheet; Compose counterpart: none (the spec lists Compose as unavailable).
- **Catalog keywords:** add "swipe", "drawer", "panel" if missing.
- **Changeset:** "SideSheet: `edge` (`start` / `end`), swipe to dismiss the modal sheet, `swipeable` on both sheets."
- **Architecture §9 "Sheets":** record the four decisions and update "Not in v1".

## Not in scope

- Predictive back (no web API yet; still "Not in v1").
- Swiping a closed sheet open from the window edge (an edge swipe competes with the browsers' own back and forward gestures).
- The standard sheet's width overshoot on open, tracked separately.
