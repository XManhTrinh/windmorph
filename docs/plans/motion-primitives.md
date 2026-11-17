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
| `staggerDelays` | `(count: number, options?) => readonly number[]` | When each of `count` items starts: the times a spring from 0 to `count` passes it |
| `useEntrance` | `(ref, options?) => { entered: boolean; play: boolean }` | Whether an element's entrance should play: once, when it first comes into view, never for content that was on screen as the page hydrated |

### Options

```ts
interface M3SpringValueOptions {
  /** The spring: spatial for positions and sizes, effects for opacity and colour. @default "spatial" */
  family?: SpringFamily;
  /** @default "default" */
  speed?: SpringSpeed;
  /** The first value, for an entrance (a bar from its baseline). @default the first target */
  from?: number;
  /** Seconds before the first move only; later targets move at once. @default 0 */
  delay?: number;
  /** `false` jumps to each target (off screen, a hidden tab). @default true */
  animate?: boolean;
}
```

`useM3SpringValues` takes the same, plus `rest` (the value a new element starts at when there was no list before; default 0).

## Behaviour

- **The theme's spring:** the scheme comes from `ThemeScope` (`useM3Spring`), so a scope with `motion="standard"` gets the standard springs.
- **Interrupted keeps its speed:** a new target mid-move starts from the current position and velocity. `useM3SpringValue` uses Motion's `animate`, which reads the value's velocity. `useM3SpringValues` keeps a position and a velocity per element and advances them all in one frame callback with the analytic spring (`spring()` per element, restarted from the element's current state on each new target), so 84 points are one loop, not 84 animations.
- **Another length:** the old positions and velocities are read at the new places by straight-line interpolation (`resample`), so a 7-point line becomes an 84-point one by moving, with no path-morphing library.
- **Reduced motion** (the library's rule, §6): a `spatial` value jumps to each target, as the spatial tokens are 0ms; an `effects` value keeps its spring, as fades do. `AnimatedNumber` shows the new value at once. `staggerDelays` returns zeros. Before, `useM3Spring` alone returned the standard spring and each component skipped movement itself; these do it for their callers.
- **`staggerDelays`:** the FAB menu's model made general: the count springs from 0 to `count` on the slow effects spring (default; `spring` option) and item `i` starts when it passes `i`, so any number of items arrives within one spring's time. `fab-menu-stagger.ts` then uses it.
- **`useEntrance`:** `play` is false on the server and for an element in view when the page hydrates (its final picture was in the server's HTML, so replaying from nothing would flash); it turns true once when the element first comes into view (`useInView`, a quarter showing by default; `amount` option) for content mounted out of view or mounted later by the client. `entered` says the entrance has run or was skipped. A hidden tab (`document.hidden`) defers it.
- **`AnimatedNumber`:** `value`, `format` (default `Intl.NumberFormat` in `useLocale()`'s locale, with the target's decimals), `from`, `delay`, `className`, `style`, `ref`, `id`, `data-*`. It lays the final value out invisibly in the same grid cell as the counting one, so the box never changes width while counting; the counting text is `aria-hidden` and the final one is what assistive technology reads. It isn't a live region: announcing a change is the app's choice. In the server's HTML it is the final value.
- **Server rendering:** no `window` or `document` at module load; every hook returns its target on the server.

## API conventions

`M3` in the hooks' names, as `useM3Spring`, `useM3Morph` and `useM3Interaction`; `staggerDelays` and `useEntrance` describe what they return. All five go in `/primitives` (building blocks, not M3 components) and on the docs site's Primitives page.

## Tests

Unit: velocity kept across a retarget (the position and its derivative are continuous at the switch), the analytic list spring against Motion's own for one element, resampling, reduced motion (spatial jumps, effects keep), `staggerDelays` against the FAB menu's existing steps, `useEntrance` on the server, at hydration in view and out of view, `AnimatedNumber`'s accessible text and width. Browser (Storybook, frame by frame): no overshoot under the standard scheme, an interruption mid-move, a list changing length, the reduced-motion recorder.

## Not in this plan

Dragging with inertia (decay, then a snap): a different model from a spring, for its own plan when something zooms or pans. View transitions stay an extra a component may use where the browser has them.

## As built (2026-11-17)

- **No `from` on the hooks:** an entrance switches the target instead (the start state while `useEntrance` says it waits, then the final one), so the hooks keep one meaning, "spring to this", and the server's HTML is always the final picture. `delay` applies to the move it's given with (an entrance's stagger), not only the first.
- **`useEntrance` returns `{ entered, inView }`:** `entered` is false only while an entrance waits; `inView` (any part showing) is what `animate` should follow, so a change off screen lands at once.
- **`staggerDelays` is pure:** under reduced motion the caller drops the delays (a spatial move is instant there anyway).
- **The FAB menu shares the maths, not the function:** its steps keep Compose's timing (an item shows once the count passes it); `staggerDelays` starts the first item at once. Both use `timeToReach` from `motion/spring-state.ts`.
- **`AnimatedNumber`'s moving figure is written by the spring alone,** never rendered by React after the first paint, which would flash the new value for a frame.
