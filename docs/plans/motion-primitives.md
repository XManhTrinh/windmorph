# Plan: motion primitives for values

Status: **approved 2026-11-17, built**. See "As built" for where the build settled a detail. Five building blocks in `@windmorph/react/primitives` that move numbers, lists of numbers and entrances on the theme's springs. Windmorph Pro's charts are the first to use them (its `docs/plans/charts.md`); they are general, so they belong here.

## The problem

M3 Expressive's motion system is the springs: spatial for position, size and shape, effects for colour and opacity, three speeds, two schemes. Components get them from the CSS tokens and from `useM3Spring` / `getM3Spring`. What the library doesn't have is a way to put them on **data**: a value that changes, a list of values that changes length, a number that counts, items that arrive one after another, an entrance that waits until it's seen. Without these, each component writes its own (an earlier prototype did: a number spring that dropped its delay under reduced motion, and a list spring that lost its speed when a new target arrived mid-move).

The decision (2026-11-17): **springs stay the only physics; these add choreography on top of them, not new curves.** No bounce or elastic curves outside the two schemes, no looping motion, no curve or duration per use.

## What exists elsewhere

- Motion (a peer dependency already) animates a `MotionValue` with `animate(value, target, spring)`, starting from its current value and velocity; `useSpring` follows another value; `useInView` reports visibility; `spring()` is the analytic generator.
- Other animation libraries offer a hook for one spring value and one for a list of springs, and a separate counting-number component.
- Compose's floating action button menu staggers its items by springing the **number of visible items** (an `Int` on the slow effects spring), so a longer menu takes no longer; the FAB menu here copies it (`components/fab-menu/fab-menu-stagger.ts`, internal).

## The pieces

| Export | Signature | Does |
|---|---|---|
| `useM3SpringValue` | `(target: number, options?) => MotionValue<number>` | Springs to each new `target` on the theme's spring, from where it is and at the speed it has |
| `useM3SpringValues` | `(targets: readonly number[], options?) => MotionValue<readonly number[]>` | The same for a list that moves as one; a list of another length starts from the old one read at the new places |
| `AnimatedNumber` | component | A number that springs between values, formatted by a function, its final value given once to assistive technology |
| `resample` | `(values, length, rest?) => number[]` | A list read at another length along the same span (how a list of another length starts) |
| `staggerDelays` | `(count: number, options?) => number[]` | When each of `count` items starts: the times a spring from 0 to `count` passes it |
| `useEntrance` | `(ref, options?) => { entered: boolean; inView: boolean }` | Whether an element's entrance waits: once, until it first comes into view, never for content that was on screen as the page hydrated; and whether a change is worth animating |

### Options

```ts
interface M3SpringValueOptions {
  /** The spring: spatial for positions and sizes, effects for opacity and colour. @default "spatial" */
  family?: SpringFamily;
  /** @default "default" */
  speed?: SpringSpeed;
  /** Seconds a move from rest waits; a value already moving turns to a new target at once. @default 0 */
  delay?: number;
  /** `false` jumps to each target (off screen, a hidden tab). @default true */
  animate?: boolean;
}
```

`useM3SpringValues` takes the same, with `delay` one for all or one per element, plus `rest` (where a new element starts: one for all, per element, or a function of the list as it shows at the change; default 0) and `keys` (names matching a new list to the old one: a kept key carries on, a new one starts at `rest`; without them elements match by place).

## Behaviour

- **The theme's spring:** the scheme comes from `ThemeScope` (`useM3Spring`), so a scope with `motion="standard"` gets the standard springs.
- **Interrupted keeps its speed:** a new target mid-move starts from the current position and velocity. `useM3SpringValue` uses Motion's `animate`, which reads the value's velocity. `useM3SpringValues` keeps a position and a velocity per element and advances them all in one frame callback with the closed-form spring (`springState`), restarted from each element's current state on each new target, so 84 points are one loop, not 84 animations.
- **Delays wait from rest:** an element at rest waits its delay (an entrance one after another); one already moving turns to a new target at once, keeping its speed, rather than holding still or swinging about its position for the delay.
- **Another length:** the old positions and velocities are read at the new places by straight-line interpolation (`resample`), so a 7-point line becomes an 84-point one by moving, with no path-morphing library.
- **By key** (added in the audit, 2026-11-17, for the charts' plan §6: "a place that stays moves, a new one grows from the baseline"): with `keys`, a new list is matched to the old one by name, so a window of a feed sliding on keeps each kept element's state and starts a new one at `rest` (per element: a point's x at its own place).
- **Reduced motion** (the library's rule, §6): a `spatial` value jumps to each target, as the spatial tokens are 0ms; an `effects` value keeps its spring, as fades do. `AnimatedNumber` shows the new value at once. `staggerDelays` stays pure: the caller drops the delays. Before, `useM3Spring` alone returned the standard spring and each component skipped movement itself; these do it for their callers.
- **`staggerDelays`:** the FAB menu's model made general: the count springs from 0 to `count` on the slow effects spring (default; `spring` option) and item `i` starts when it passes `i`, so any number of items arrives within one spring's time. `fab-menu-stagger.ts` then uses it.
- **`useEntrance`:** `entered` is true on the server and for an element with any part on screen when the page hydrates (its final picture was in the server's HTML, so replaying from nothing would flash). Mounted by the client, or hydrated wholly out of view, it is false until the element first comes into view (an `IntersectionObserver`: a quarter of it by default, or that share of the window for an element taller than it; `amount` option). `inView` says any part shows. A hidden tab (`document.hidden`) defers it; with nothing to observe it shows the final picture.
- **`AnimatedNumber`:** `value`, `format` (default `Intl.NumberFormat` in `useLocale()`'s locale, with the target's decimals), `from`, `delay`, `className`, `style`, `ref`, `id`, `data-*`. It lays the final value out invisibly, sizing the box, and draws the counting figure over it (right-aligned, so the last digit stays put, and out of the box's sizing, so a longer figure counting down never widens it); the counting text is `aria-hidden` and the final one is what assistive technology reads, and a copy gives it once. The default format shows at most three decimals, as `Intl.NumberFormat`'s own default. It isn't a live region: announcing a change is the app's choice. In the server's HTML it is the final value.
- **Server rendering:** no `window` or `document` at module load; every hook returns its target on the server.

## API conventions

`M3` in the hooks' names, as `useM3Spring`, `useM3Morph` and `useM3Interaction`; `staggerDelays` and `useEntrance` describe what they return. All five go in `/primitives` (building blocks, not M3 components) and on the docs site's Primitives page.

## Tests

Unit: velocity kept across a retarget (carried past a target just ahead), delays from rest only, a list hidden by `Activity` mid-move and shown again, `springState` against its own derivative, resampling, reduced motion (spatial jumps, effects keep), `staggerDelays` against the FAB menu's existing steps, `useEntrance` on the server, at hydration in view and out of view, `AnimatedNumber`'s accessible text and width. Browser (Storybook, frame by frame): no overshoot under the standard scheme, an interruption mid-move, a list changing length, the reduced-motion recorder.

## Not in this plan

Dragging with inertia (decay, then a snap): a different model from a spring, for its own plan when something zooms or pans. View transitions stay an extra a component may use where the browser has them.

## As built (2026-11-17)

- **No `from` on the hooks:** an entrance switches the target instead (the start state while `useEntrance` says it waits, then the final one), so the hooks keep one meaning, "spring to this", and the server's HTML is always the final picture. `delay` applies to any move from rest (an entrance's stagger), not only the first; a moving value turns at once (audit, 2026-11-17).
- **`useEntrance` returns `{ entered, inView }`:** `entered` is false only while an entrance waits; `inView` (any part showing) is what `animate` should follow, so a change off screen lands at once.
- **`staggerDelays` is pure:** under reduced motion the caller drops the delays (a spatial move is instant there anyway).
- **The FAB menu shares the maths, not the function:** its steps keep Compose's timing (an item shows once the count passes it); `staggerDelays` starts the first item at once. Both use `timeToReach` from `motion/spring-state.ts`.
- **`AnimatedNumber`'s moving figure is written by the spring alone,** never rendered by React after the first paint, which would flash the new value for a frame.
