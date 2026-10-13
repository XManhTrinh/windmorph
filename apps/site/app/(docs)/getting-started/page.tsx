import type { Metadata } from 'next';
import { CodeBlock } from '@windmorph/react-pro';
import { highlightSource } from '../../../lib/highlight';
import { guideMetadata } from '../../../lib/site-metadata';
import { InstallCommand } from '../../../components/install-command';
import { InlineCode } from '../../../components/inline-code';

export const metadata: Metadata = guideMetadata('/getting-started');

const CSS_SNIPPET = `@import 'tailwindcss';
@import '@windmorph/react/styles.css';
@source '../node_modules/@windmorph/react';`;

const COMPILED_CSS_SNIPPET = `/* No Tailwind? Import the precompiled stylesheet instead. */
import '@windmorph/react/styles.compiled.css';`;

const PROVIDER_SNIPPET = `import { ThemeProvider } from '@windmorph/react';

export function App({ children }) {
  return <ThemeProvider defaultTheme="baseline">{children}</ThemeProvider>;
}`;

const FONT_SNIPPET = `// app/layout.tsx
import { Roboto_Flex } from 'next/font/google';

const robotoFlex = Roboto_Flex({
  subsets: ['latin'],
  axes: ['wdth', 'opsz', 'GRAD'],
  variable: '--md-ref-typeface-brand',
  display: 'swap',
});

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={robotoFlex.variable}>
      <body style={{ '--md-ref-typeface-plain': 'var(--md-ref-typeface-brand)' }}>
        {children}
      </body>
    </html>
  );
}`;

const ICON_SNIPPET = `import { Button } from '@windmorph/react';

// Material Symbols SVGs are passed as React elements; fill="currentColor" makes them
// inherit the component's colour role. No icon font is bundled.
const SearchIcon = (
  <svg viewBox="0 -960 960 960" fill="currentColor" aria-hidden="true">
    <path d="M784-120 532-372q-30 24-69 38t-83 14q-109 0-184.5-75.5T120-580q0-109 75.5-184.5T380-840q109 0 184.5 75.5T640-580q0 44-14 83t-38 69l252 252-56 56ZM380-400q75 0 127.5-52.5T560-580q0-75-52.5-127.5T380-760q-75 0-127.5 52.5T200-580q0 75 52.5 127.5T380-400Z" />
  </svg>
);

<Button leadingIcon={SearchIcon}>Search</Button>;`;

const ROUTER_SNIPPET = `// Non-Next apps: client-side links go through React Aria's RouterProvider.
import { RouterProvider } from 'react-aria';
import { useNavigate, useHref } from 'react-router-dom';

function Providers({ children }) {
  const navigate = useNavigate();
  return (
    <RouterProvider navigate={navigate} useHref={useHref}>
      {children}
    </RouterProvider>
  );
}

// Then links are just an href on a component:
// <Button href="/pricing">Pricing</Button>`;

const NEXT_ROUTER_SNIPPET = `// Next.js: one-line integration.
import { NextRouterProvider } from '@windmorph/react/next';

<NextRouterProvider>{children}</NextRouterProvider>;`;

const VITE_SNIPPET = `// vite.config.ts — silence Vite 8's harmless "use client" warnings.
export default defineConfig({
  build: {
    rolldownOptions: {
      onLog(level, log, handler) {
        if (log.code !== 'MODULE_LEVEL_DIRECTIVE') handler(level, log);
      },
    },
  },
});`;

export default async function GettingStartedPage() {
  const [
    cssHtml,
    compiledHtml,
    providerHtml,
    fontHtml,
    iconHtml,
    routerHtml,
    nextRouterHtml,
    viteHtml,
  ] = await Promise.all([
    highlightSource(CSS_SNIPPET, 'css'),
    highlightSource(COMPILED_CSS_SNIPPET, 'ts'),
    highlightSource(PROVIDER_SNIPPET, 'tsx'),
    highlightSource(FONT_SNIPPET, 'tsx'),
    highlightSource(ICON_SNIPPET, 'tsx'),
    highlightSource(ROUTER_SNIPPET, 'tsx'),
    highlightSource(NEXT_ROUTER_SNIPPET, 'tsx'),
    highlightSource(VITE_SNIPPET, 'ts'),
  ]);

  return (
    <article className="mx-auto flex max-w-3xl flex-col gap-10">
      <header className="flex flex-col gap-3">
        <h1 className="text-headline-large text-on-surface">Getting started</h1>
        <p className="text-body-large text-on-surface-variant">
          @windmorph/react is a React component library implementing Material Design 3 Expressive,
          built on React Aria, Tailwind CSS v4 and Motion. This guide installs the package, wires up
          the stylesheet and fonts, and shows how icons and links work.
        </p>
      </header>

      <section className="flex flex-col gap-4">
        <h2 id="install" className="text-headline-small text-on-surface">
          Install
        </h2>
        <p className="text-body-large text-on-surface-variant">
          Install the package together with <InlineCode>motion</InlineCode>, which is a peer
          dependency used by the animated components.
        </p>
        <InstallCommand packages="@windmorph/react motion" />
      </section>

      <section className="flex flex-col gap-4">
        <h2 id="add-the-stylesheet" className="text-headline-small text-on-surface">
          Add the stylesheet
        </h2>
        <p className="text-body-large text-on-surface-variant">
          In a Tailwind v4 project (Vite or Next.js), import Tailwind and the library tokens into
          your CSS entry. The <InlineCode>@source</InlineCode> line tells Tailwind to scan the
          compiled library so it generates the utility classes the components use. The library’s own
          stylesheet does the same with <InlineCode>@source &apos;../&apos;</InlineCode>.
        </p>
        <CodeBlock code={CSS_SNIPPET} html={cssHtml} lang="css" title="globals.css" />
        <p className="text-body-large text-on-surface-variant">
          Not using Tailwind? Import the precompiled stylesheet instead and skip the Tailwind setup.
        </p>
        <CodeBlock
          code={COMPILED_CSS_SNIPPET}
          html={compiledHtml}
          lang="ts"
          title="Without Tailwind"
        />
      </section>

      <section className="flex flex-col gap-4">
        <h2 id="wrap-your-app" className="text-headline-small text-on-surface">
          Wrap your app
        </h2>
        <p className="text-body-large text-on-surface-variant">
          Wrap the tree in <InlineCode>ThemeProvider</InlineCode>. It provides the colour theme,
          mode, contrast level and motion scheme, and remembers the selection between visits.
        </p>
        <CodeBlock code={PROVIDER_SNIPPET} html={providerHtml} lang="tsx" title="App.tsx" />
      </section>

      <section className="flex flex-col gap-4">
        <h2 id="load-the-font" className="text-headline-small text-on-surface">
          Load the font
        </h2>
        <p className="text-body-large text-on-surface-variant">
          Fonts are not bundled. Load{' '}
          <a
            className="text-primary underline"
            href="https://fonts.google.com/specimen/Roboto+Flex"
          >
            Roboto Flex
          </a>{' '}
          with <InlineCode>next/font</InlineCode> (or Google Fonts) and map it to the brand typeface
          variable. Without it, the system UI font is used. The{' '}
          <InlineCode>--md-ref-typeface-plain</InlineCode> variable points at the brand variable so
          body text picks it up too.
        </p>
        <CodeBlock code={FONT_SNIPPET} html={fontHtml} lang="tsx" title="app/layout.tsx" />
      </section>

      <section className="flex flex-col gap-4">
        <h2 id="icons" className="text-headline-small text-on-surface">
          Icons
        </h2>
        <p className="text-body-large text-on-surface-variant">
          Icons are plain Material Symbols SVGs passed as React elements to props like{' '}
          <InlineCode>icon</InlineCode> or <InlineCode>leadingIcon</InlineCode>. Using{' '}
          <InlineCode>fill=&quot;currentColor&quot;</InlineCode> lets each icon inherit the colour
          role of the component it sits in. There is no icon font.
        </p>
        <CodeBlock code={ICON_SNIPPET} html={iconHtml} lang="tsx" title="icon.tsx" />
      </section>

      <section className="flex flex-col gap-4">
        <h2 id="links-and-routing" className="text-headline-small text-on-surface">
          Links &amp; routing
        </h2>
        <p className="text-body-large text-on-surface-variant">
          Links are an <InlineCode>href</InlineCode> on buttons, menu items and tabs, routed
          client-side through React Aria’s <InlineCode>RouterProvider</InlineCode>. For non-Next
          apps, wrap the tree in <InlineCode>RouterProvider</InlineCode> from{' '}
          <InlineCode>react-aria</InlineCode> with your router’s navigate helper.
        </p>
        <CodeBlock code={ROUTER_SNIPPET} html={routerHtml} lang="tsx" title="providers.tsx" />
        <p className="text-body-large text-on-surface-variant">
          On Next.js, use <InlineCode>NextRouterProvider</InlineCode> from{' '}
          <InlineCode>@windmorph/react/next</InlineCode> — a one-liner that wires{' '}
          <InlineCode>RouterProvider</InlineCode> to the Next router. See the{' '}
          <a className="text-primary underline" href="/nextjs">
            Next.js guide
          </a>
          .
        </p>
        <CodeBlock code={NEXT_ROUTER_SNIPPET} html={nextRouterHtml} lang="tsx" title="layout.tsx" />
      </section>

      <section className="flex flex-col gap-4">
        <h2 id="vite-8-note" className="text-headline-small text-on-surface">
          Vite 8 note
        </h2>
        <p className="text-body-large text-on-surface-variant">
          Interactive modules ship with a <InlineCode>&quot;use client&quot;</InlineCode> directive.
          Vite 8 (rolldown) logs a harmless <InlineCode>MODULE_LEVEL_DIRECTIVE</InlineCode> warning
          for each one in client-only builds. Silence it in your Vite config.
        </p>
        <CodeBlock code={VITE_SNIPPET} html={viteHtml} lang="ts" title="vite.config.ts" />
      </section>
    </article>
  );
}
