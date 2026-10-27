# @windmorph/react

React components implementing **Material Design 3 Expressive**, built on
[React Aria](https://react-spectrum.adobe.com/react-aria/), [Tailwind CSS v4](https://tailwindcss.com)
and [Motion](https://motion.dev). Semantic design tokens, component tokens, six built-in themes,
light and dark modes with three contrast levels, M3 Expressive springs, right-to-left support and
accessible components by default. Works with Vite and Next.js (App Router and Pages Router).

**Docs and live examples: [windmorph.dev](https://windmorph.dev/)**

## Install

```bash
npm i @windmorph/react motion
```

Peer dependencies: `react` and `react-dom` 19, `motion` 14, and optionally `tailwindcss` 4.1 or
later and `next` 15 or later.

### Browser support

0.1.0 is tested on Chrome and Edge. Safari 17.5+ and Firefox 129+ are supported targets, with
full testing coming next. Older browsers skip some entry animations (`@starting-style`).

### With Tailwind CSS v4

```css
/* globals.css */
@import 'tailwindcss';
@import '@windmorph/react/styles.css';
@source '../node_modules/@windmorph/react';
```

`@source` lets Tailwind see the classes the components use; adjust the path to where
`node_modules` sits relative to your CSS file. The colour roles, type scale, shapes and motion
are then Tailwind utilities in your own code too (`bg-surface`, `text-on-surface-variant`,
`text-body-large`, `rounded-corner-large`, …).

### Without Tailwind

Import `@windmorph/react/styles.compiled.css` instead: the same styles, already compiled.

### Fonts

Fonts are not bundled. Load [Roboto Flex](https://fonts.google.com/specimen/Roboto+Flex) with
`next/font` or Google Fonts; without it, the system UI font is used.

## Use

Wrap the app in `ThemeProvider`:

```tsx
import { Button, ThemeProvider } from '@windmorph/react';

export function App() {
  return (
    <ThemeProvider defaultTheme="baseline">
      <Button variant="filled">Label</Button>
    </ThemeProvider>
  );
}
```

`ThemeProvider` holds the theme, the mode (`light`, `dark` or `system`), the contrast level and
the motion scheme, remembers the visitor's choice, and exposes it through `useTheme`.
`ThemeScope` gives part of a page its own theme.

## Next.js

Interactive components are client components (`"use client"`), so server components can render
them. The `@windmorph/react/next` entry adds:

- `NextRouterProvider`, so the library's links (`href` on `Button`, `ListItem`, `Tab`, …) navigate
  with the Next.js router;
- `getThemeFromCookies` and `themeAttributes`, so the App Router renders the visitor's theme on the
  server with no flash (`ThemeScript` does the same for static pages and the Pages Router);
- `useNavigationGuard` and `useGuardedNavigate`, to ask before leaving unsaved changes.

See the [Next.js guide](https://windmorph.dev/nextjs).

## Custom themes

Six themes are built in (`baseline`, `ocean`, `forest`, `sunset`, `rose`, `slate`). Make your
own from a brand colour with the M3 2025 colour spec, and pass it to `ThemeProvider`:

```tsx
import { createTheme, ThemeProvider } from '@windmorph/react';

const brand = createTheme({
  name: 'brand',
  seed: '#1877F2',
  variant: 'vibrant', // tonal-spot (default) | neutral | vibrant | expressive
  // Optional: take any of the six palettes from another variant or a hex colour,
  // e.g. vivid accents on calm, nearly neutral surfaces.
  palettes: { neutral: 'tonal-spot', neutralVariant: 'tonal-spot' },
});

<ThemeProvider themes={['baseline', brand]} defaultTheme="brand">
  {children}
</ThemeProvider>;
```

For static sites, the `windmorph` CLI writes the same CSS to a file:

```bash
npx @windmorph/react theme --name brand --seed "#1877F2" --variant vibrant \
  --palette neutral=tonal-spot --palette neutral-variant=tonal-spot --out brand.css
```

See the [Theming guide](https://windmorph.dev/theming) for modes, contrast levels,
`ThemeScope`, mixing palettes and flash-free server rendering.

## Entries

| Import                                 | What it holds                                                           |
| -------------------------------------- | ----------------------------------------------------------------------- |
| `@windmorph/react`                     | The components, theming, tokens and `cn()`                              |
| `@windmorph/react/next`                | The Next.js helpers above                                               |
| `@windmorph/react/primitives`          | Lower-level building blocks, for components built on top of the library |
| `@windmorph/react/styles.css`          | The tokens, themes and utilities, for Tailwind CSS v4                   |
| `@windmorph/react/styles.compiled.css` | The same, compiled, for apps without Tailwind                           |

## Vite 8 and `"use client"`

Vite 8 logs a harmless `MODULE_LEVEL_DIRECTIVE` warning for each `"use client"` module in
client-only builds. To silence it:

```ts
// vite.config.ts
export default defineConfig({
  build: {
    rolldownOptions: {
      onLog(level, log, handler) {
        if (log.code !== 'MODULE_LEVEL_DIRECTIVE') handler(level, log);
      },
    },
  },
});
```

## Documentation

[windmorph.dev](https://windmorph.dev/) has the getting-started, theming, motion,
customisation, accessibility, Next.js and from-Compose guides, the spec status, the release
notes, and a page per component with live examples and generated props tables.

## Licence

MIT. Bundles `@material/material-color-utilities` and code ported from the Android Open Source
Project (Apache-2.0); see `NOTICE`.
