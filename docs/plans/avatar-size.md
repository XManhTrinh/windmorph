# Plan: Avatar without the runtime shape library (`@windmorph/react-pro`, with a core part)

Status: **approved 2026-10-17**; the core part is built (2026-10-17), Pro's part follows against it. Closes Pro architecture §10 "`Avatar`'s size".

## Goal

An Avatar with an M3 Expressive shape costs an app about 13 KB of gzipped JavaScript today, and a round one costs the same. The cost is the core's shape library: `Avatar` calls `materialShapeMask(name)` (core `src/shapes/mask.ts`), which builds the shape's `RoundedPolygon` at runtime and serialises it to an SVG path. That pulls `material-shapes`, `rounded-polygon`, `cubic`, `features`, `point`, `shapes`, `corner-rounding` and `path` into every app that renders an Avatar, even one that only ever draws circles. `avatar-shapes.ts` also imports `materialShapeNames`, which drags in the 35 shape builders on its own.

The shapes Avatar and ShapedIcon draw never move, so their outlines can be computed once at build time. The engine stays in the core for what really morphs (the loading indicator, the wavy progress indicator, `useM3Morph`).

## What it costs today (measured 2026-10-17 from the core's `dist` at `60122179`)

| What                                                                                              | Gzipped                                                                         |
| ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| The modules `materialShapeMask` imports, each gzipped on its own (as the "~13 KB" in §10 counts)  | 13.0 KB                                                                         |
| The same modules gzipped as one chunk                                                             | 11.5 KB                                                                         |
| Avatar's own Pro code (`bundle-size.json`, which leaves the core out)                             | 5.8 KB                                                                          |
| **All 35 outlines as precomputed path strings in one module** (3 decimals, leading zeros dropped) | **10.5 KB**                                                                     |
| One outline on its own                                                                            | 159 B (Arch) to 824 B (Boom); 392 B for Cookie12Sided; SoftBoom alone is 2.2 KB |

**The key finding:** a single table of all 35 precomputed paths is nearly as heavy as the engine it replaces. Precomputing only helps if **an app pays for the shapes it uses and nothing else**, so the plan is shaped around that, not around "precompute and look up by name".

## Decisions

| #   | Decision                                                | Value                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| --- | ------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Where the outlines live                                 | **In the core**, next to the engine that produces them (`packages/react/src/shapes/generated/material-shape-paths.ts`), exported from `@windmorph/react/primitives`. The core owns `MaterialShapes` and its unit-square normalisation, so generating there means the outlines can't drift from the shapes, and `materialShapeMask` is already public core API that Pro builds on (core §3). Pro never copies core code (Pro `CLAUDE.md`)                                                                                                                                      |
| 2   | One value per shape, tree-shakable                      | 35 flat named exports, `circleShape` … `heartShape` (camelCase of Compose's `MaterialShapes` names plus `Shape`, since `circle`, `pill` and `star` are already the core's polygon builders), each a `MaterialShapePath`: `{ name: 'Cookie12Sided', path: 'M…' }`. Plain string constants with no side effects, so every bundler drops the ones an app doesn't import (the package is `sideEffects: ["*.css"]`). Flat names, not a namespace object, because namespace re-exports don't tree-shake reliably across bundlers, and flat named exports are the core's rule anyway |
| 3   | The whole set, for galleries                            | `materialShapePaths` (a `Record<MaterialShapeName, MaterialShapePath>`) in its own module, for the docs site's gallery and playground, or an app's shape picker. Importing it costs the 10.5 KB, but only for whoever imports it                                                                                                                                                                                                                                                                                                                                              |
| 4   | `shape` takes the value, not a name                     | `Avatar` `shape?: 'circle' \| 'rounded' \| MaterialShapePath`; `ShapedIcon` and `EmptyState` `shape?: 'circle' \| MaterialShapePath`. **This is the only API that gives per-shape cost:** a string prop has to be resolved through a table, and the table is the 10.5 KB. It is the same pattern icon libraries use for the same reason (one import per icon). Pro is unreleased, so there's no alias (Pro §2)                                                                                                                                                                |
| 5   | Custom shapes for free                                  | `MaterialShapePath` is structural (`{ readonly name: string; readonly path: string }`, a path in the unit square), so an app can pass its own outline (a brand shape) with no new prop. `data-shape` carries `name`                                                                                                                                                                                                                                                                                                                                                           |
| 6   | `materialShapeMask` takes the value                     | Core `materialShapeMask(shape: MaterialShapePath): string` wraps the path in the existing 1 × 1 SVG `data:` URI (cached per value in a `WeakMap`). It no longer imports the engine. A caller holding a name uses `materialShapeMask(materialShapePaths[name])`. The core is unreleased too (0.1.0 pending), so the signature changes without an alias                                                                                                                                                                                                                         |
| 7   | Names list without the builders                         | `materialShapeNames` and `MaterialShapeName` move to the generated module (a literal tuple), and `material-shapes.ts` imports them from there; a unit test checks the tuple equals the builders' keys. Pro's `avatarShapes` export goes: the docs read `materialShapePaths`                                                                                                                                                                                                                                                                                                   |
| 8   | Precision                                               | **3 decimals in the unit square** (error at most 0.0005 of the size: 0.03px on a 56px avatar, 0.12px at 240px). 2 decimals would save another 30% but errs up to 1.2px at 240px, visible on the cookie and clover curves. Leading zeros dropped and `-` used as a separator (`.5-.25`), which is valid SVG path syntax                                                                                                                                                                                                                                                        |
| 9   | Delivery: CSS `mask-image` with a `data:` URI, as today | Compared below. It is the only option that scales with the box, works across the core's browser baseline and needs no ids or extra DOM. The URI keeps going through the private `--_wm-avatar-mask` variable (2026-10-16), so forced colours can still drop it                                                                                                                                                                                                                                                                                                                |
| 10  | Build-time generation, checked in                       | `pnpm generate` in the core writes `material-shape-paths.ts` with `polygonToPath(MaterialShapes[name])` rounded to 3 decimals. The file is checked in, so its diff is reviewable, and a unit test regenerates it in memory and fails if the checked-in copy is stale (as `component-tokens.txt` is checked)                                                                                                                                                                                                                                                                   |
| 11  | What still needs the engine at runtime                  | Nothing in Pro. Avatar, ShapedIcon and EmptyState never morph. The core's `LoadingIndicator`, wavy `ProgressIndicator` and `useM3Morph` keep the engine (they interpolate shapes every frame), and `MaterialShapes`, `Morph`, `RoundedPolygon` and `polygonToPath` stay public. If Avatar ever gains a shape morph, it loads the engine on demand (the core's `onDemand`) and draws the static outline until it arrives                                                                                                                                                       |
| 12  | RTL                                                     | **Not mirrored**, as today and as Compose: Compose's `RoundedPolygon.toShape()` receives `layoutDirection` and never reads it (its `createOutline` only scales and centres the path, `MaterialShapes.kt`). The shapes are glyph-like, not directional. Mirroring would also double the data. Documented on the Avatar page                                                                                                                                                                                                                                                    |
| 13  | Forced colours                                          | Unchanged: the circle fallback from 2026-10-16 (`forced-colors:[mask-image:none] forced-colors:rounded-corner-full` with the `CanvasText` border) reads the same variable, so it works with any `MaterialShapePath`, a custom one included. ShapedIcon keeps only its icon there (its recorded exception)                                                                                                                                                                                                                                                                     |
| 14  | Hydration                                               | Precomputed strings remove the one hydration risk the runtime path had: `Math.sin` / `Math.cos` differing in the last bits between Node and the browser (core §3 "Shape library", the 9-decimal snapping added after a server-rendered Avatar mismatched). The server and the client now emit the same constant                                                                                                                                                                                                                                                               |

### How masks are delivered: the options

| Option                                                                            | Scales with the box                                                                      | Browser support (core baseline: Chrome / Edge 113+, Safari 17.5+, Firefox 129+)                                              | Extra DOM / ids                                                                                                                  | Verdict                                                                                                                                                                                                                                   |
| --------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `clip-path: path()`                                                               | No: `path()` takes absolute user units, so each px size needs its own path               | Wide                                                                                                                         | None                                                                                                                             | Rejected                                                                                                                                                                                                                                  |
| `clip-path: shape()`                                                              | Yes (percentages "relative to the width and height of the element's reference box", MDN) | MDN: "Baseline 2026. Newly available … since February 2026": outside Safari 17.5 and Firefox 129                             | None                                                                                                                             | Rejected for now; worth revisiting when the baseline moves                                                                                                                                                                                |
| Inline SVG `<clipPath clipPathUnits="objectBoundingBox">` + `clip-path: url(#id)` | Yes                                                                                      | Wide                                                                                                                         | An SVG and a unique id per avatar (`useId`), repeated in every avatar's HTML; a portal into another document loses the reference | Rejected                                                                                                                                                                                                                                  |
| An external SVG file (`mask-image: url(/shapes/x.svg)`)                           | Yes                                                                                      | Wide                                                                                                                         | None, but a network request per shape and an asset the app must serve                                                            | Rejected                                                                                                                                                                                                                                  |
| A hoisted, deduplicated `<style href precedence>` per used shape (React 19)       | Yes                                                                                      | Wide                                                                                                                         | None per avatar                                                                                                                  | Rejected: React hoists into the main document's `<head>`, so a portal into an iframe loses the rule, and a strict CSP needs a nonce on every `<style>`. The repeated per-avatar URI it would save compresses to almost nothing under gzip |
| **`mask-image: url("data:image/svg+xml,…")` + `mask-size: 100% 100%` (today)**    | **Yes**                                                                                  | MDN: available "across browsers since December 2023" (unprefixed in Chrome 120); Chrome / Edge 113–119 need `-webkit-mask-*` | None                                                                                                                             | **Chosen.** Check that the compiled CSS carries `-webkit-mask-image` / `-size` / `-repeat` for Chrome 113–119 (Lightning CSS adds them for the build's targets; add them by hand in the variant if it doesn't)                            |

## API

```tsx
import { Avatar } from '@windmorph/react-pro';
import { cookie12SidedShape } from '@windmorph/react/primitives';

<Avatar name="Zoë Müller" src="/zoe.jpg" alt="Zoë Müller" shape={cookie12SidedShape} />
<Avatar name="Sam Lee" />                          {/* circle: no shape data at all */}
<Avatar name="Priya Shah" shape="rounded" />
<ShapedIcon shape={sunnyShape} color="primary"><SearchIcon /></ShapedIcon>
```

Core additions (TSDoc-ready):

```ts
/**
 * A static shape outline: a closed SVG path in the unit square (0–1 on both axes), drawn
 * with a CSS mask that scales with the element. The 35 M3 Expressive shapes are exported as
 * `<name>Shape` constants; any outline in the unit square works.
 */
export interface MaterialShapePath {
  /** The shape's name, written to the component's `data-shape` (e.g. `Cookie12Sided`). */
  readonly name: string;
  /** SVG path data in the unit square, 3 decimals. */
  readonly path: string;
}

/** The M3 Expressive Cookie12Sided shape, precomputed (Compose `MaterialShapes.Cookie12Sided`). */
export const cookie12SidedShape: MaterialShapePath;
// … one per shape

/** Every M3 Expressive shape by name. Costs all 35 outlines (about 10.5 KB gzipped). */
export const materialShapePaths: Readonly<Record<MaterialShapeName, MaterialShapePath>>;

/** A static outline as a CSS `mask-image` value (an SVG `data:` URI in a 1 × 1 box). */
export function materialShapeMask(shape: MaterialShapePath): string;
```

Pro: `AvatarShape` becomes `'circle' | 'rounded' | MaterialShapePath`; `ShapedIconShape` / `EmptyStateShape` `'circle' | MaterialShapePath`. Pro does not re-export the core's constants (one source; apps already install the core as a peer); the docs show the `@windmorph/react/primitives` import.

## Scaling with px sizes

Avatar (24 / 32 / 40 / 56 / … px) and ShapedIcon (40 / 56 / 64 / 96px) size themselves in px (2026-10-16), and the mask is `mask-size: 100% 100%` over a `viewBox="0 0 1 1"` SVG, so one outline serves every size and a consumer `size-*` class, and 200% text changes nothing. `overflow="visible"` stays on the mask SVG (harmless for static normalised shapes, which sit inside the unit square).

## Size budgets

Pro's `pnpm size` leaves the core out (it's a peer), which is why the 13 KB never showed in `bundle-size.json`. The plan adds a check that sees it:

- **Shape probes** (new `probes` section in `packages/react-pro/bundle-size.json`): `scripts/bundle-size.ts` bundles three tiny entries with the core included and React, React Aria and Motion external, tree-shaken, and records the difference between them: `Avatar` round, `Avatar` with `cookie12SidedShape`, `Avatar` with `softBoomShape`. Budgets: **round avatar: 0 B of shape code**, and the probe fails if the bundle contains `RoundedPolygon` or any `shapes/rounded-polygon` module; **Cookie12Sided: at most 600 B** over the round one (392 B of path plus the mask helper); **SoftBoom: at most 2.5 KB**. The same probes run for `ShapedIcon`. The bundling uses tsdown's programmatic `build()` (tsdown is already a devDependency); if that can't be done without adding a package, ask before adding one.
- **Pro's own budget:** `components/avatar/Avatar` (5800 B) is re-measured with `pnpm size:update` after the change (it loses the `materialShapeNames` import, so it should shrink slightly) and committed with the change.
- **Core guard:** the core's `scripts/check-dist.ts` fails the build if `shapes/mask.js` or `shapes/generated/*` imports `material-shapes.js` or `rounded-polygon.js` (as it already guards `ButtonGroup` → `Menu` and `PullToRefresh` → `LoadingIndicator`).

**Expected result:** an app with round avatars saves about 11.5–13 KB; one with a Cookie12Sided avatar saves about 11 KB; the docs site's shape gallery costs about the same as today, by design.

## Tests

**Core (unit):**

- The generator: every `materialShapePaths[name].path` matches `polygonToPath(MaterialShapes[name])` within 0.0005 at every coordinate (parsed numerically, not as text); the checked-in file equals a fresh generation; `materialShapeNames` equals the builders' keys.
- `materialShapeMask`: same output for the same value (cached), a valid `data:` URI, a custom `MaterialShapePath` accepted, and its module imports no engine module (checked on `dist` by `check-dist.ts`).

**Pro (unit):** Avatar, ShapedIcon and EmptyState with a shape value set `--_wm-avatar-mask` (or `mask-image`) and `data-shape="<name>"`; a custom outline works; `'circle'` and `'rounded'` set no mask; server and client render the same HTML (`renderToString` against a hydrated render, no mismatch warning); axe on each; the forced-colours classes still read the variable.

**Pro (e2e, Mac baselines, as Pro §7):**

- **Pixel equivalence:** each of the 35 shapes drawn at 240px with the old runtime mask (4 decimals, built in the test from the core's engine) and the new precomputed one; per-pixel difference no more than 1 level of alpha on anti-aliased edges and none inside the shape.
- The existing `avatar.spec.ts`, `shaped-icon` and `empty-state` screenshots must match their current baselines (themes × modes × contrast, RTL, forced colours, the layout-safety matrix); any change is a regression, not a re-record.
- The forced-colours spec "an Expressive shape keeps a whole round edge" stays green with a value and with a custom outline.

## Docs site

- **Avatar** page: the shapes example imports constants (`cookie12SidedShape`, …) from `@windmorph/react/primitives`; a "Shapes and bundle size" note (round and rounded avatars carry no shape data; each shape costs only its outline; `materialShapePaths` for pickers); the RTL note (not mirrored); the playground's shape control maps names through `materialShapePaths`.
- **ShapedIcon** and **EmptyState** pages and examples (`shaped-icon-tones`, `empty-state-search`, `avatar-shapes`, `avatar-photos`) switch to the constants; the playground descriptor `containment-pro.tsx` too.
- **Primitives** page (core): `MaterialShapePath`, the 35 `<name>Shape` constants (one table, generated from the record), `materialShapePaths`, the new `materialShapeMask(shape)` signature, and when to use the engine instead (morphing).
- Props tables pick up the new `shape` types; the site's `props-docs.test.ts` gap list follows the pinned Pro build.

## Release

- Core and Pro change together (same minor, Pro §8): the core part first (generator, constants, `materialShapeMask` signature, `check-dist` guard, Primitives page), then Pro moves `CORE_SHA` and switches Avatar, ShapedIcon and EmptyState.
- Changesets: core ("`materialShapeMask` takes a `MaterialShapePath`; new precomputed shape constants"), Pro ("`shape` takes a shape value, e.g. `cookie12SidedShape`, instead of a name; `avatarShapes` removed; about 11–13 KB smaller").
- Pro architecture: remove the §10 "Avatar's size" item and record the decision under the media components; core architecture §3 "Shape library": the precomputed outlines and the engine-free `materialShapeMask`.

## Built: the core part (2026-10-17)

- `pnpm generate` writes `src/shapes/generated/material-shape-paths.ts` (the names tuple and the 35 constants) and `material-shape-path-record.ts` (`materialShapePaths`), both checked in; `scripts/material-shape-paths.test.ts` checks they're current, that the names equal the builders' keys and that every coordinate is within 0.0005 of the engine's unrounded one.
- `materialShapeMask(shape: MaterialShapePath)` imports no engine module; `scripts/check-dist.ts` guards it and the generated modules.
- The core's own probes (`scripts/lib/shape-probes.ts`, run by `pnpm size`) bundle tiny entries against `dist/primitives.js` with tsdown's `build()` (no new dependency), tree-shaken and minified with dependencies left out. Measured, gzipped:

| Probe                                  | Before (name → runtime engine) | After                                  |
| -------------------------------------- | ------------------------------ | -------------------------------------- |
| `materialShapeMask` with Cookie12Sided | 6647 B                         | 628 B (helper 257 B + 371 B outline)   |
| `materialShapeMask` with SoftBoom      | 6647 B                         | 2538 B (helper 257 B + 2281 B outline) |
| `materialShapePaths` (all 35)          | (not available)                | 10703 B                                |

Budgets: the helper alone 300 B, Cookie12Sided 600 B over it, SoftBoom 2560 B over it, the record 11000 B; any probe that bundles `material-shapes.js` or `rounded-polygon.js` fails.

- Compiled CSS: Tailwind's optimised (minified) output adds `-webkit-mask-image`, `-webkit-mask-size` and `-webkit-mask-repeat` to mask utilities and arbitrary properties; unminified development output and React inline styles don't, so a component sets the mask through a class reading `--_wm-avatar-mask`, never an inline `maskImage` alone.

## Not in scope

- A press or hover shape morph on Avatar (decision 11 says how it would load).
- `shape()` as the delivery once the browser baseline reaches it (the generator could emit it from the same paths).
