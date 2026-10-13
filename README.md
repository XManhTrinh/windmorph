<p align="center">
  <img src="docs/assets/windmorph-logo.png" alt="Windmorph logo" width="320" />
</p>

# Windmorph

Monorepo for **[@windmorph/react](packages/react)**, a React component library implementing
**Material Design 3 Expressive**, with its documentation site and test apps.

Built on [React Aria](https://react-spectrum.adobe.com/react-aria/), [Tailwind CSS v4](https://tailwindcss.com)
and [Motion](https://motion.dev). Semantic design tokens, light and dark modes with three contrast
levels, full right-to-left support, and accessible components by default. Works with Vite and
Next.js (App Router and Pages Router).

**Docs and live examples: [windmorph.vercel.app](https://windmorph.vercel.app/)**

## What's inside

| Folder                                         | What it is                                                                                                                                    |
| ---------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| [`packages/react`](packages/react)             | `@windmorph/react` (MIT): the M3 Expressive components, theming, tokens, the `windmorph` CLI, and the `/next` and `/primitives` entries.      |
| [`packages/test-utils`](packages/test-utils)   | `@windmorph/test-utils`: the axe check, Tailwind class checks and Vitest setup the packages' tests share.                                     |
| [`apps/site`](apps/site)                       | The documentation site (Next.js static export): guides, and a page per component with live examples, a playground and generated props tables. |
| [`apps/docs`](apps/docs)                       | Storybook: the workbench, with Playwright visual, behaviour and layout-safety tests.                                                          |
| [`apps/next-playground`](apps/next-playground) | A small Next.js app that checks the library under both routers, with server rendering and the no-flash theme cookie.                          |
| [`docs/`](docs)                                | Architecture and plans ([`docs/architecture.md`](docs/architecture.md), [`docs/plans`](docs/plans)).                                          |

## Using the library

```bash
npm i @windmorph/react motion
```

```css
/* globals.css */
@import 'tailwindcss';
@import '@windmorph/react/styles.css';
@source '../node_modules/@windmorph/react';
```

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

Not using Tailwind? Import `@windmorph/react/styles.compiled.css` instead. See
[`packages/react/README.md`](packages/react/README.md) for more, and the
[docs site](https://windmorph.vercel.app/getting-started) for the full guide.

## Development

**Prerequisites:** Node.js `>=24` and [pnpm](https://pnpm.io) (`pnpm@12.8.1`, from
`packageManager`). [Turborepo](https://turborepo.com) runs and caches the tasks.

```bash
pnpm install              # install every workspace

pnpm --filter site dev    # the docs site
pnpm --filter docs dev    # Storybook
pnpm build                # build every package and app
pnpm generate             # regenerate the token CSS and props data
pnpm typecheck            # type-check every workspace
pnpm lint                 # lint every workspace
pnpm test                 # unit tests
pnpm test:e2e             # Playwright tests
pnpm format               # Prettier
pnpm check:traces         # fails on names and text the public repo mustn't contain
```

Build one package with `pnpm --filter @windmorph/react build`. Each app and package has its own
scripts in its `package.json`.

The docs site also documents **Windmorph Pro** (`@windmorph/react-pro`), a separate commercial
package it installs as an optional dependency. Without access to Pro, `pnpm install` skips it and
everything except the docs site builds and tests as usual.

## Releasing

Versions and publishing use [Changesets](https://github.com/changesets/changesets):

```bash
pnpm changeset            # record a change
pnpm version-packages     # apply the version bumps
pnpm release              # build @windmorph/react and publish
```

## Licence

`@windmorph/react` is MIT. It bundles
[`@material/material-color-utilities`](https://github.com/material-foundation/material-color-utilities)
and code ported from the Android Open Source Project (Apache-2.0); see
[`packages/react/NOTICE`](packages/react/NOTICE) and [`LICENSE`](LICENSE).
