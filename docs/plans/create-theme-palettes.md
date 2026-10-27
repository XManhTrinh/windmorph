# Plan: per-palette sources for `createTheme`

Status: **approved and built on 2026-10-08 (branch `feat/create-theme-palettes`)**

## Goal

Let a theme take each of its M3 palettes from a different source, so a brand can have vivid accents on calm neutral surfaces, or its own tertiary colour.

The first need came from an app that wanted the `vibrant` blue theme's buttons, but whose dark surfaces turned navy (`surface` `#020A2F`). With the neutral palettes taken from `tonal-spot` instead, the buttons stay `#84ADFF` while `surface` becomes `#0D0E12`, close to the baseline theme's `#0F0D12` (checked on the app's home and sign-up screens, 2026-10-08).

The library is meant for many products, so the option follows the model designers already know from Google's Material Theme Builder, whose "core colours" are primary, secondary, tertiary, error, neutral and neutral variant, each settable on its own.

## How M3 builds a scheme

An M3 `DynamicScheme` is made of six tonal palettes (primary, secondary, tertiary, error, neutral, neutral variant). Each colour role picks a tone from one palette, following the 2025 colour spec's contrast rules. A scheme variant (`tonal-spot`, `vibrant` and so on) is a recipe for those six palettes from one seed. `material-color-utilities` already accepts a `DynamicScheme` built from any six palettes, so the change is to choose each palette's source, while the roles, tones and contrast rules stay M3's.

## Decisions

| # | Decision | Value |
|---|---|---|
| 1 | API | A `palettes` option on `createTheme` (and on `ThemeSeed`, so built-in themes could use it later): `{ primary?, secondary?, tertiary?, error?, neutral?, neutralVariant? }` |
| 2 | Palette sources | Each entry is either **a scheme variant** (`'tonal-spot'`, `'vibrant'`, …), meaning that palette from that variant of the same seed, or **a hex colour**, meaning a palette built from that colour's hue and chroma, as Material Theme Builder does for a core colour |
| 3 | Defaults | Anything left out comes from `variant`, as today. Without `palettes`, every theme's CSS is byte-for-byte unchanged (tested against the current output of all built-in themes) |
| 4 | Roles and contrast | Unchanged: every role still takes its tone from the M3 2025 spec with the theme's `variant` and contrast level, so `on-*` roles keep their contrast with their containers whatever the palettes are |
| 5 | Validation | Unknown palette names, unknown variants and malformed hex colours throw clear errors, as `seed` does today |
| 6 | CLI | `--palette <name>=<source>`, repeatable, e.g. `--palette neutral=tonal-spot --palette neutral-variant=tonal-spot --palette tertiary=#00A07A` |
| 7 | Docs | The guidance that a hex neutral should be low in chroma (a vivid hex makes vivid surfaces), and that a variant source is the easy way to calm surfaces |

## API

```ts
import { createTheme } from '@windmorph/react';

// Vivid blue accents on calm, nearly neutral surfaces.
const blue = createTheme({
  name: 'blue',
  seed: '#1877F2',
  variant: 'vibrant',
  palettes: { neutral: 'tonal-spot', neutralVariant: 'tonal-spot' },
});

// A brand's own tertiary colour.
const lotus = createTheme({
  name: 'lotus',
  seed: '#D63A7A',
  variant: 'vibrant',
  palettes: { tertiary: '#00A07A' },
});
```

```bash
npx @windmorph/react theme --name blue --seed "#1877F2" --variant vibrant \
  --palette neutral=tonal-spot --palette neutral-variant=tonal-spot --out blue.css
```

New types: `ThemePalettes` (the option) and `PaletteSource` (`SchemeVariant | \`#${string}\``).

## Files

```
packages/react/src/tokens/color.ts       ThemeSeed gains `palettes`; PALETTE_NAMES; types
packages/react/src/theme/scheme.ts       builds the DynamicScheme from the chosen palettes
packages/react/src/theme/create-theme.ts passes `palettes` through
packages/react/src/theme/css.ts          (unchanged API; reads `palettes` from the seed)
packages/react/src/cli.ts                --palette option
packages/react/src/theme/*.test.ts       tests below
apps/site/app/(docs)/theming/         a "Mixing palettes" section with a live example
.changeset/                           minor: createTheme `palettes`
docs/architecture.md                  theming section: the option and when to use it
```

## Tests and checks

- **No change without the option:** the generated CSS of all six built-in themes is identical to today's.
- **Variant sources:** with `palettes: { neutral: 'tonal-spot', neutralVariant: 'tonal-spot' }`, the accent roles (`primary*`, `secondary*`, `tertiary*`, `error*`, `inverse-primary`, `surface-tint`) equal the `vibrant` theme's, in light and dark at every contrast level, and the surfaces are calmer (lower chroma than vibrant's, below 8). The neutral roles are tonal-spot's palettes at vibrant's tones, so they are close to, not identical with, the tonal-spot theme's (e.g. dark `surface-container` `#18191E` against `#171A1F`). The blue example gives `surface` `#0D0E12` and `primary` `#84ADFF` in dark, and `#F7F6FB` and `#0058BB` in light.
- **Hex sources:** a hex tertiary gives a palette whose hue matches the hex, and the tertiary roles follow it.
- **Contrast:** for every theme in the tests, each `on-*` role keeps at least 4.5:1 against its role at standard contrast (and the spec's higher targets at medium and high).
- **Errors:** unknown palette names, unknown variants and bad hex colours throw.
- **CLI:** `--palette` parsing, repeats, and errors.
- **Docs site:** the new section renders, and passes the existing axe smoke test.
- `pnpm typecheck`, `pnpm lint`, `pnpm test` and the docs-site checks pass.
