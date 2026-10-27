# Plan: a pending state on Button and IconButton (`@windmorph/react`)

Status: **approved 2026-10-17, built 2026-10-17.** Follows the conventions review's B8 ("Core `Button` has no loading state … a feature, needs a plan").

## Goal

A button whose action takes a moment (Save, Send, Check for updates, Sign in) needs to show that the action is running and stop a second press, without changing size, losing keyboard focus or going silent for screen readers. Apps hand-roll it today by swapping the label for a spinner and setting `disabled`, which shifts the layout, drops focus to the page (a focused button that becomes disabled loses focus) and announces nothing.

## When to use it

| Use | When |
|---|---|
| `pending` on the button | The action the person just started takes longer than about 200ms and the result shows where they are (a form submit, a save, a check) |
| `LoadingIndicator` in the content | Content is loading in a region, not an action from one button |
| `ProgressIndicator` (determinate) | The wait is long (over 5s) and its progress is known: an upload, an export |
| `disabled` | The action isn't available at all (a form that isn't valid yet) |

M3: "Avoid applying progress indicators to every button in a list" (Progress indicators, Guidelines); the docs repeat it.

## What M3 says (m3.material.io, saved 2026-10-17)

- Loading indicator, Guidelines: "Loading indicators can be placed within other components, such as buttons, to indicate that the action is ongoing, such as validating a form or checking for updates." / "Loading indicators can be placed in buttons that take a few seconds to take effect." / "loading indicators are a better alternative for short processes between 200ms and 5s." / "It should be between 24dp to 240dp."
- Loading indicator, Overview: "Recommended as a replacement for indeterminate circular progress indicators."
- Loading indicator, Accessibility: "When integrated into another component, such as a button, make sure that the active indicator provides a visual contrast of at least 3:1 against the other component."
- Progress indicators, Guidelines, "Progress indicators in buttons": "A circular indicator can be placed in a button to show that the button's action is currently in progress. In very small buttons, use the flat shape since the wavy shape is not as visible at that size. To ensure a minimum 3:1 contrast ratio, change the active indicator color to be the same color as the button's icon or label text, and remove the track."

M3 defines no button prop or token for it; it is guidance on composing the two components.

## What others do (fetched 2026-10-17)

| Library | Prop | Indicator and placement | Interaction | Accessibility |
|---|---|---|---|---|
| React Aria Components `Button` | `isPending` | The app renders a `ProgressBar` / `ProgressCircle` child; docs: reserve the label's space with `visibility: hidden` or `opacity: 0`, delay a spinner with `opacity: 0` | "disables press and hover events while retaining focusability"; a `type="submit"` button renders `type="button"` while pending; `href` cleared | `aria-disabled="true"`; the progress element's id appended to `aria-labelledby`; the change announced (assertive) while the button is focused; `data-pending` |
| React 19 | `useFormStatus().pending`, `useActionState` / `useTransition` `isPending` | — | The docs' example disables the submit button while `pending` | — |
| Chakra UI `Button` | `loading`, `loadingText`, `spinner`, `spinnerPlacement` (`start` default) | Spinner at the start, optional replacement text | — | — |
| Mantine `Button` | `loading`, `loaderProps` | A loader "with overlay will be rendered in the center of the button" | "the `Button` will be disabled" | — |
| Angular Material (main) | `showProgress` + a projected `[progressIndicator]` element | The app's indicator in a container over the label | Unchanged (combine with `disabledInteractive`) | None added |
| Another widely used React Material library | `loading`, `loadingIndicator` (a 16px circular progress), `loadingPosition` (`center` default) | Centred over the hidden label by default | Disabled | — |

The strongest pattern: **centred indicator over the hidden content (width kept), presses blocked but focus kept, the state in the accessible name and announced** (React Aria, which is also the core's accessibility layer). Native `disabled` (two of the rows above) is the weaker choice because it drops focus.

## Decisions

| # | Decision | Value |
|---|---|---|
| 1 | Name | **`pending`**. React's own vocabulary for an action in flight (`useFormStatus().pending`, `useActionState` / `useTransition` `isPending`) and React Aria's `isPending` without the `is` (core §9, "no public `is*` props"). The core already reserves `loading` for content being fetched (`Select`, `Autocomplete` options) and Pro uses `pending` for an action not yet confirmed (`CommentRow`), the same idea; `submitting` is form-scoped and wrong for "Check for updates". Data hook: `data-pending` |
| 2 | Which components | **`Button` and `IconButton`** (React Aria's `Button` covers both; the other libraries put `loading` on their icon buttons too). **Not** toggle buttons (the types forbid `pending` with `toggle`: a toggle's state is its selection, and React Aria's `ToggleButton` has no pending state), **not** `Fab` / `ExtendedFab` (M3 shows indicators in buttons, not FABs, which mostly navigate or open), **not** `SplitButton` for now (its leading half is `ButtonBase` with its own corners; it can follow once an app needs it, with the same rules) |
| 3 | The indicator | The core's **`LoadingIndicator`**, uncontained, indeterminate: M3 recommends it over the indeterminate circular indicator for 200ms–5s waits and names buttons as a use. Its colour is the button's content colour (M3's 3:1 rule; the slot sets `--md-comp-loading-indicator-active-indicator-color: currentColor`). Size: the icon's size, at least M3's 24px minimum: 24 / 24 / 24 / 32 / 40px for XS–XL (`LoadingIndicator` `size`, which keeps its 38/48 ratio) |
| 4 | Replaceable | `pendingIndicator?: ReactElement` replaces it (the core's "icons can be replaced" rule), e.g. a flat `CircularProgressIndicator` for a wait that may pass 5s (M3's "Long (over 5s): Use a progress indicator"). The slot passes it the same size and colour context |
| 5 | Loaded on demand | Through the existing `LazyLoadingIndicator`, so `Button` never carries the shape library up front (`scripts/check-dist.ts` fails the build on a static import, as it does for `PullToRefresh`). A button that receives a `pending` prop at all (`true` or `false`) preloads it when the browser is idle (`usePreloadWhenIdle`) and on intent (`usePreloadOnIntent`), so it is ready long before the first press resolves into `pending` |
| 6 | Width and layout | The width never changes: the content (icon and label) and the indicator share one grid cell inside the library-owned `content` wrapper (`grid-area: 1 / 1`); the content goes to `opacity: 0` and stays laid out, the indicator is centred over it. No positioned children (§10 rules 2–3) |
| 7 | When it shows | Visually after **200ms** (M3's lower bound for a loading indicator), as a `transition-delay` on the swap, so a quick action never flashes; presses are blocked and the state is exposed from the first frame. If `pending` ends sooner, nothing visible happens. When it ends, the content returns at once (fast effects fade, no delay) |
| 8 | Presses | Blocked while pending: `onPress` and the toggle handlers don't run, Enter and Space do nothing, the hover and pressed state layers and the press morph don't show (`useM3Interaction` treats it as disabled for those). A `type="submit"` button renders `type="button"` while pending, so Enter in a field doesn't submit the form again (React Aria's behaviour). A link button (`href`) stays a link with `aria-disabled="true"` and its navigation prevented (React Aria `useLink` `isDisabled`) |
| 9 | Focus | Kept: the button is **not** natively disabled, so focus stays on it through the whole wait and the focus ring stays visible; Tab still reaches it (React Aria: "Pending buttons remain focusable, but are otherwise disabled") |
| 10 | Accessible name | The label stays in the name, and `labels.pending` (default "Loading") is added after it while pending: "Save, Loading". For a text button a visually hidden span in the content; for an `aria-label` the name is combined (`IconButton`'s tooltip keeps showing only the `aria-label`); for `aria-labelledby` a hidden element's id is appended (React Aria appends the progress element's id the same way). The visible indicator itself is `aria-hidden`, so the name doesn't wait for the lazy module (React Aria: "The `ProgressBar` must be in the accessibility tree as soon as the button becomes pending") |
| 11 | State | `aria-disabled="true"` while pending (React Aria). **No `aria-busy`:** it is a live-region property telling assistive technology to "wait until the modifications or changes are complete before exposing the content" (MDN), which on a button would at best do nothing and at worst hide the change |
| 12 | Announcement | When `pending` turns on while focus is within the button, a polite announcement of the new name ("Save, Loading"). Only for the focused button, as React Aria does, so a page of buttons never chatters. It goes through a new internal `announce()` (`utils/announce.ts`): one body-level `role="status"` region created on first use in the browser, which waits 100ms after it mounts before its first message (screen readers ignore a region that arrives with its content; React Aria's announcer waits the same 100ms, and Pro's live regions follow the same rule). Polite, not React Aria's assertive: the person just pressed the button and expects the change, so it shouldn't cut off what is being read (ARIA: assertive is for urgent messages). Nothing is announced when it ends; the result (a snackbar, an error, a new page) is the app's to announce, and the docs say so |
| 13 | `disabled` together with `pending` | `disabled` wins: natively disabled, disabled colours, not focusable; the indicator still shows, in the disabled content colour, since the action is still running |
| 14 | Colours | The button keeps its enabled colours while pending (it isn't unavailable, it's busy); only the content swaps for the indicator. Forced colours: the indicator is `currentColor` (`ButtonText`), the button keeps its `CanvasText` border |
| 15 | Server rendering | A button rendered with `pending` on the server shows its label (with `aria-disabled` and the name suffix already in the HTML) until the indicator's module arrives; the content hides only once the indicator is mounted (`data-pending-shown`), so it is never an empty button. Nothing touches `window` at module load |
| 16 | Labels | `labels?: Partial<ButtonLabels>` on `Button` and `IconButton`, `ButtonLabels = { pending: string }` (default "Loading"), per the core's labels rule |

## API

```tsx
const [state, submit, isPending] = useActionState(saveProfile, null);

<form action={submit}>
  {/* … */}
  <Button type="submit" pending={isPending}>Save</Button>
</form>

<IconButton aria-label="Refresh" pending={refreshing} onPress={refresh} icon={<RefreshIcon />} />
<Button pending={exporting} pendingIndicator={<CircularProgressIndicator aria-label="Exporting" />}>Export</Button>
```

New props (TSDoc-ready):

```ts
/**
 * Shows a loading indicator in place of the content while an action runs, and blocks
 * presses. The button keeps its width, its colours and keyboard focus; its accessible name
 * gains `labels.pending`, and a focused button announces it. The indicator appears after
 * 200ms, so a quick action doesn't flash. Use it for actions that take a moment, not for
 * every button in a list. A submit button doesn't submit again while pending.
 * @default false
 */
pending?: boolean;

/**
 * Replaces the loading indicator shown while `pending`, e.g. a `CircularProgressIndicator`
 * for a wait that may pass five seconds. It takes the icon's size and the content colour.
 */
pendingIndicator?: ReactElement;

/** Words the button announces. */
labels?: Partial<ButtonLabels>;

export interface ButtonLabels {
  /** Added to the accessible name while `pending`. @default "Loading" */
  pending: string;
}
```

`classNames` gains `pendingIndicator` on `Button` and `IconButton`. The toggle variants of `ButtonProps` / `IconButtonProps` take `pending?: never`.

## Motion

- The swap is an opacity crossfade on the **fast effects** spring (colour and opacity never overshoot), delayed 200ms on the way in, immediate on the way out. No size, corner or position change.
- The indicator runs its own indeterminate animation (core §9 "Loading indicator").
- **Reduced motion** (§6): the crossfade stays (a fade isn't movement); the indicator only rotates its first shape, as `LoadingIndicator` already does under reduced motion (essential motion: it shows activity).

## Tokens

No new tokens: M3 has no button token for this, and the indicator's colour and size follow the button's content colour and icon size. The inner `LoadingIndicator` keeps its own token set; the slot sets its colour token to `currentColor`, so an app restyles it through `classNames.pendingIndicator` or its own `pendingIndicator`.

## Layout safety

The grid cell lives in the library-owned `content` wrapper, so `className` on the root (`fixed`, `w-full`, overflow, transforms) is untouched; the width is the content's, measured by layout, not by script, so a `w-full` or `flex-1` button keeps the width it had. The layout-safety matrix runs with `pending`.

## RTL and density

The indicator isn't mirrored (it's a rotating shape; Compose doesn't mirror it). Density changes only the button's height (IconButton) and the indicator keeps the icon's size, which density doesn't change.

## Tests

**Unit (Vitest + Testing Library):**
- Press, Enter and Space don't call `onPress` while pending; a submit button doesn't submit its form on click or on Enter in a field (`type` is `button` while pending, `submit` after); a link button's navigation is prevented and it keeps `href` and role `link`.
- Focus stays on the button as `pending` turns on and off (keyboard press → pending → done); it stays in the Tab order.
- `aria-disabled="true"` only while pending; the name is "Save, Loading" while pending and "Save" after, for a text button, an `aria-label` and an `aria-labelledby`; `labels.pending` replaces the word; IconButton's tooltip shows only its `aria-label`.
- The announcement fires once when a focused button becomes pending, not for an unfocused one, not when it ends; the region exists 100ms before the first message.
- `disabled` + `pending`: native `disabled`, indicator shown.
- `data-pending` on the root; `classNames.pendingIndicator` reaches the slot; `pendingIndicator` replaces the default; the toggle form rejects `pending` (`@ts-expect-error` type test).
- Server render with `pending`: label visible, `aria-disabled` and the name suffix present, no hydration warning.
- axe on every variant pending, disabled + pending, and IconButton pending.
- `check-dist.ts`: `Button` and `IconButton` don't import `LoadingIndicator` statically.

**e2e (Playwright, apps/docs):**
- The width and height of every variant × size are identical (to the px) before, during and after pending, for a short and a long label and for IconButton widths; nothing around it moves.
- Contrast: the indicator against the container is at least 3:1 for every variant in every theme × mode × contrast level (computed colours; M3's 3:1 rule).
- A keyboard press that makes the button pending keeps `document.activeElement` on it on every frame.
- No visible change when `pending` lasts under 200ms (frames recorded).
- Reduced motion (`e2e/reduced-motion.ts`): only opacity transitions on the button.
- Screenshots: variants × sizes pending, light / dark / high contrast, RTL, forced colours, density −3 for IconButton; scroll guard and forced-colours guard over the new stories; the layout-safety matrix with `pending`.

## Docs site

- **Button** page (`content/components/button.tsx`): a "Pending" section with a `useActionState` form example (`examples/button/button-pending.tsx`) and a replaced-indicator example; when to use it (the table above) and M3's "not every button in a list".
- **IconButton** page: a pending example (refresh).
- **Accessibility data** (`accessibility/button.ts`, `icon-button.ts`): Screen reader (the name gains "Loading", announced when focused), Focus (stays on the button), Motion (crossfade only), What you need to do (set `pending` only while the action runs; announce the result yourself; don't also set `disabled`, which drops focus).
- **Playground:** a `pending` control for Button and IconButton (and `pendingIndicator` in `notControlled` with its reason); `descriptors.test.ts` follows.
- **Spec data:** "Loading indicator in a button" mapped to the pending example (M3 guidance, built on the core's `LoadingIndicator`).
- **Search keywords:** "loading", "spinner", "busy", "submitting".
- **Changeset:** "Button and IconButton: `pending` (+ `pendingIndicator`, `labels.pending`)."
- **Architecture §9 "Expressive Button family":** record the decisions; §3 lists the internal `announce()`.

## Not in scope

- `SplitButton` and the FABs (decision 2).
- A determinate progress fill inside a button.

## As built (2026-10-17)

Built as decided, with these details settled while building:

- **`ButtonBase` carries the behaviour** through its own `ButtonBasePendingProps`, kept out of `ButtonBaseActionProps` / `ButtonBaseLinkProps`, so the FABs, chips and cards that extend those types don't inherit a `pending` they wouldn't draw.
- **Implicit submission:** `type="button"` alone doesn't stop Enter in a form's only field from submitting it (HTML's implicit submission needs no submit button when the form has one field). While pending, a submit button also stops a submission that has no submitter, or itself as the submitter, before it reaches React or the browser; another submit button of the form still works.
- **The announcer** is the existing internal `utils/announce.ts` region (`aria-live="polite"`, which `role="status"` would imply), now created as soon as a button takes `pending` (`prepareAnnouncer`), so its first message never waits for the region.
- **A progress indicator as `pendingIndicator`** gets M3's "Progress indicators in buttons" treatment without app code: the slot also sets the progress indicator's active colour to `currentColor` and its track to transparent.
- **The name's suffix** is a visually hidden `, Loading` after the text. Chromium puts a space before the comma ("Save , Loading"), which speech doesn't voice; an `aria-label` takes the suffix exactly ("Refresh, Loading").
- **Size:** `Button` grows from 12.7 to 18.3 kB gzipped and `IconButton` from 18.6 to 22.8 kB as the budget script counts them (unminified, comments included; the pending hook, the presence and preload helpers and the announcer). The indicator itself stays out (`check-dist.ts`).

