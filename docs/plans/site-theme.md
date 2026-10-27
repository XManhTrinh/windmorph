# Plan: a Windmorph theme for the docs site

Status: **step 1 built (2026-10-11)**: the theme came first as an extra option in the display settings. `apps/site/lib/site-themes.ts` adds `windmorph` to the theme menu, ahead of the six built-ins; `windmorph` is the site's default (2026-10-11, decision 3), for the docs site only: the library's built-in themes and default are unchanged. The navy alternative (`windmorph-navy`) was tried and dropped (2026-10-11). The guide example (6) and the contrast test still wait for approval.

## Goal

Give the docs site (`apps/site`) a colour theme taken from the Windmorph logo, using two of the logo's colours: its blue as the seed and its teal as the tertiary palette. It is the site's brand theme, not a seventh built-in theme in the library, and it is built only with the public `createTheme` API (decision #23: the site uses nothing but Windmorph), which makes it a worked example of `palettes`.

## Colours from the logo

Sampled from the original logo mark (opaque pixels, grouped by hue):

| Hue | Average | Where |
|---|---|---|
| 230° | `#142074` | darkest navy, bottom of the left strokes |
| 220° | `#15348F` | royal blue, left strokes |
| 210° | `#1F5AAB` | blue, the middle of the mark |
| 200° | `#2577B3` | azure |
| 170° | `#2CDECE` | teal, the right stroke |

The two picked: **seed `#1F5AAB`** (the middle of the blue range) and **tertiary `#2CDECE`**.

## Variant

`tonal-spot` (the built-in themes' variant) caps the primary palette's chroma, which turns the logo's blue into a dull slate (`primary` `#485F8B`). `vibrant` keeps it blue (`#0059B6`), but its neutral palettes are tinted with the seed too, so dark surfaces turn navy (`surface` `#010B2F`). As with the blue theme in `create-theme-palettes.md`, the neutrals come from `tonal-spot`:

```ts
createTheme({
  name: 'windmorph',
  seed: '#1F5AAB',
  variant: 'vibrant',
  palettes: {
    tertiary: '#2CDECE',
    neutral: 'tonal-spot',
    neutralVariant: 'tonal-spot',
  },
});
```

Standard contrast:

| Role | Light | Dark |
|---|---|---|
| primary / on-primary | `#0059B6` / `#EFF2FF` | `#81AEFF` / `#002D62` |
| primary-container | `#68A0FF` | `#68A0FF` |
| secondary / container | `#3454B7` / `#C5D0FF` | `#7B98FF` / `#193EA1` |
| tertiary / container | `#00675F` / `#5BFDEC` | `#C5FFF6` / `#5BFDEC` |
| surface / container | `#F7F6FB` / `#E8E7EE` | `#0D0E12` / `#181A1E` |

Roles still take their tones from the M3 2025 spec, so every contrast pair holds at all three contrast levels.

**Alternative:** keep `vibrant`'s own neutrals. Dark mode then picks up the logo tile's navy (`surface` `#010B2F`, `surface-container` `#061642`). It's closer to the logo, but every dark page turns blue. Tried as `windmorph-navy` and dropped (2026-10-11).

## Decisions

| # | Decision | Value |
|---|---|---|
| 1 | Where | `apps/site/lib/site-theme.ts` exports the `createTheme` result; the root layout passes it to `ThemeProvider`'s `themes` with the six built-ins |
| 2 | Name | `windmorph` (`data-theme="windmorph"`), labelled "Windmorph" in the display settings' theme menu, listed first |
| 3 | Default | The site's default theme becomes `windmorph`: a site-side default state (`{ ...DEFAULT_THEME_STATE, theme: 'windmorph' }`) feeds both `ThemeProvider` and `getThemeScriptSource`, so the pre-paint script and the provider agree and nothing flashes. A visitor's stored choice still wins |
| 4 | No flash | `ThemeProvider` injects the theme's CSS as a hoisted React 19 `<style precedence>`, which the static export renders into the HTML, so the colours are there before first paint. A smoke test checks `--md-sys-color-primary` on first load with scripts disabled |
| 5 | Examples | Live examples follow the page's theme, so they show the Windmorph colours by default; the six built-ins stay in the picker, so readers can still see each one |
| 6 | Guide | The theming guide's `createTheme` section shows this theme as its two-colour example, with the logo's colours |
| 7 | Library | No library change. If `ThemeProvider` turns out not to server-render a custom theme's CSS on the static export, that's a library fix with its own plan, not a site workaround |

## Checks

- Unit: the theme's role pairs meet 4.5:1 (content) and 3:1 (containers against `surface`) at every contrast level, as the built-in themes' test does.
- Smoke suite: the existing pages pass with `windmorph` as the default (render, no console errors, axe, RTL, dark mode); a new test switches between `windmorph` and `baseline` in the display settings.
- The static export's HTML contains the `windmorph` CSS (no flash).
- Screenshots of home and a component page in light and dark, reviewed before commit.
