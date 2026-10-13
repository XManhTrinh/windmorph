# Plan: success and warning colour roles (custom colours)

Status: **approved on 2026-10-10, built and merged (e41e583)**

## Goal

M3's colour roles have primary, secondary, tertiary and error, but no green for success or amber for warning. Apps need both everywhere ("Open now", "Paid", "Verified", "Payment pending"), and `Tag` and `Alert` need them as tones. If each app picks its own, contrast and dark mode drift.

Material Theme Builder solves this with **custom colours**: a colour gets the same four roles as the key colours (colour, on-colour, container, on-container), harmonised toward the theme's source colour so it belongs to the theme. This plan builds that into the theme system, with `success` and `warning` built in.

## Decisions

| # | Decision | Value |
|---|---|---|
| 1 | Roles | Eight new roles in every theme, mode and contrast level: `success`, `on-success`, `success-container`, `on-success-container`, `warning`, `on-warning`, `warning-container`, `on-warning-container`. They become `--md-sys-color-*` variables, Tailwind utilities (`bg-success`, `text-on-warning-container`, …) and `cn()` merge groups like every other role |
| 2 | How the tones are chosen | Each custom colour's tonal palette takes **the error roles' tone rules** from the 2025 spec: the theme's scheme is rebuilt with that palette in the error slot, and `error`, `onError`, `errorContainer` and `onErrorContainer` are evaluated on it. So success and warning get exactly the contrast M3 guarantees for error, at every contrast level, in light and dark |
| 3 | Default colours | Success `#1E8E3E` (green) and warning `#F9AB00` (amber). Only their hue and chroma matter; the tones come from decision 2 |
| 4 | Harmonising | On by default, as in Material Theme Builder: `Blend.harmonize` turns each colour's hue up to 15° toward the theme's seed. `harmonize: false` keeps the exact hue, for a brand's own status colours |
| 5 | Overrides | `createTheme({ customColors: { success: '#0B8043', warning: '#E37400' }, harmonize })` and the CLI's `--custom success=#0B8043` (repeatable) and `--no-harmonize`. Only `success` and `warning` for now; more names can come later without changing these |
| 6 | Built-in themes | All six built-in themes get the eight roles with the default colours, harmonised to each theme's seed |
| 7 | Contrast test | For every built-in theme × mode × contrast level: `on-success` on `success`, `on-success-container` on `success-container`, and the same for warning, at least 4.5:1, and `success` and `warning` on `surface` at least 3:1 |

## Files

`tokens/color.ts` (the eight roles, the defaults, `ThemeSeed.customColors` and `harmonize`), `theme/scheme.ts`, `theme/create-theme.ts`, `cli.ts`, tests (`scheme`, `palettes`, `theme-css`, a contrast test), `docs/architecture.md` §5, the docs site's theming and colour pages (the new roles, with swatches), and a changeset (minor).

## Then

Windmorph Pro's `Tag` and `Alert` get `success` and `warning` tones, using these roles.
