import type { Metadata } from 'next';
import { CodeBlock } from '@windmorph/react-pro';
import { highlightSource } from '../../../lib/highlight';
import { guideMetadata } from '../../../lib/site-metadata';
import { InlineCode } from '../../../components/inline-code';

export const metadata: Metadata = guideMetadata('/nextjs');

const APP_ROUTER_SNIPPET = `// app/layout.tsx (App Router — cookie, no-flash path)
import { ThemeProvider } from '@windmorph/react';
import { NextRouterProvider, getThemeFromCookies, themeAttributes } from '@windmorph/react/next';
import { Roboto_Flex } from 'next/font/google';
import { cookies } from 'next/headers';

const robotoFlex = Roboto_Flex({
  subsets: ['latin'],
  axes: ['wdth', 'opsz', 'GRAD'],
  variable: '--md-ref-typeface-brand',
  display: 'swap',
});

export default async function RootLayout({ children }) {
  const theme = getThemeFromCookies(await cookies());
  return (
    <html lang="en" {...themeAttributes(theme)} className={robotoFlex.variable}>
      <body style={{ '--md-ref-typeface-plain': 'var(--md-ref-typeface-brand)' }}>
        <NextRouterProvider>
          <ThemeProvider
            defaultTheme={theme.theme}
            defaultMode={theme.mode}
            defaultContrast={theme.contrast}
            defaultMotion={theme.motion}
          >
            {children}
          </ThemeProvider>
        </NextRouterProvider>
      </body>
    </html>
  );
}`;

const DOCUMENT_SNIPPET = `// pages/_document.tsx (Pages Router — ThemeScript, no-flash path)
import { ThemeScript } from '@windmorph/react';
import { Head, Html, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en" suppressHydrationWarning>
      <Head>
        <ThemeScript />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}`;

const GUARD_SNIPPET = `'use client';
import { Button, Dialog, DialogActions, DialogTitle } from '@windmorph/react';
import { useNavigationGuard } from '@windmorph/react/next';
import { useState } from 'react';

export function UnsavedChanges({ dirty }: { dirty: boolean }) {
  const [leaving, setLeaving] = useState<(() => void) | null>(null);
  useNavigationGuard({ when: dirty, onAttempt: (proceed) => setLeaving(() => proceed) });
  return (
    <Dialog open={leaving !== null} onOpenChange={(open) => !open && setLeaving(null)} role="alertdialog">
      <DialogTitle>Discard your changes?</DialogTitle>
      <DialogActions>
        <Button variant="text" onPress={() => setLeaving(null)}>Keep editing</Button>
        <Button variant="text" onPress={() => leaving?.()}>Discard</Button>
      </DialogActions>
    </Dialog>
  );
}`;

const APP_SNIPPET = `// pages/_app.tsx
import { ThemeProvider } from '@windmorph/react';

export default function App({ Component, pageProps }) {
  return (
    <ThemeProvider>
      <Component {...pageProps} />
    </ThemeProvider>
  );
}`;

export default async function NextjsPage() {
  const [appRouterHtml, documentHtml, appHtml, guardHtml] = await Promise.all([
    highlightSource(APP_ROUTER_SNIPPET, 'tsx'),
    highlightSource(DOCUMENT_SNIPPET, 'tsx'),
    highlightSource(APP_SNIPPET, 'tsx'),
    highlightSource(GUARD_SNIPPET, 'tsx'),
  ]);

  return (
    <article className="mx-auto flex max-w-3xl flex-col gap-10">
      <header className="flex flex-col gap-3">
        <h1 className="text-headline-large text-on-surface">Next.js</h1>
        <p className="text-body-large text-on-surface-variant">
          Works with Next.js 15 and 16, App Router (primary) and Pages Router, on Turbopack or
          webpack. The library ships compiled ESM, so no <InlineCode>transpilePackages</InlineCode>{' '}
          is needed.
        </p>
      </header>

      <section className="flex flex-col gap-4">
        <h2 id="the-next-export-surface" className="text-headline-small text-on-surface">
          The /next export surface
        </h2>
        <p className="text-body-large text-on-surface-variant">
          <InlineCode>@windmorph/react/next</InlineCode> exports{' '}
          <InlineCode>getThemeFromCookies</InlineCode> (with <InlineCode>CookieReader</InlineCode>{' '}
          and <InlineCode>GetThemeFromCookiesOptions</InlineCode>),{' '}
          <InlineCode>NextRouterProvider</InlineCode> (with{' '}
          <InlineCode>NextRouterProviderProps</InlineCode>),{' '}
          <InlineCode>useNavigationGuard</InlineCode> and{' '}
          <InlineCode>useGuardedNavigate</InlineCode> (with{' '}
          <InlineCode>NavigationAttempt</InlineCode> and{' '}
          <InlineCode>NavigationGuardOptions</InlineCode>), and re-exports{' '}
          <InlineCode>themeAttributes</InlineCode> and the <InlineCode>ThemeState</InlineCode> type.
          Note: <InlineCode>ThemeScript</InlineCode> is not here — it comes from{' '}
          <InlineCode>@windmorph/react</InlineCode>.
        </p>
      </section>

      <section className="flex flex-col gap-4">
        <h2 id="app-router-cookie-no-flash" className="text-headline-small text-on-surface">
          App Router (cookie, no flash)
        </h2>
        <p className="text-body-large text-on-surface-variant">
          With a server you can read the theme cookie and render the right{' '}
          <InlineCode>data-*</InlineCode> attributes on <InlineCode>&lt;html&gt;</InlineCode> before
          any JS runs, so there is no theme flash. The async root layout reads{' '}
          <InlineCode>getThemeFromCookies(await cookies())</InlineCode>, spreads{' '}
          <InlineCode>themeAttributes(theme)</InlineCode>, loads Roboto Flex, and wraps children in{' '}
          <InlineCode>NextRouterProvider</InlineCode> and <InlineCode>ThemeProvider</InlineCode>.
        </p>
        <CodeBlock
          code={APP_ROUTER_SNIPPET}
          html={appRouterHtml}
          lang="tsx"
          title="app/layout.tsx"
        />
      </section>

      <section className="flex flex-col gap-4">
        <h2 id="pages-router-script-no-flash" className="text-headline-small text-on-surface">
          Pages Router (script, no flash)
        </h2>
        <p className="text-body-large text-on-surface-variant">
          Render <InlineCode>ThemeScript</InlineCode> from <InlineCode>@windmorph/react</InlineCode>{' '}
          inside <InlineCode>&lt;Head&gt;</InlineCode> with{' '}
          <InlineCode>suppressHydrationWarning</InlineCode> on <InlineCode>&lt;Html&gt;</InlineCode>
          , then wrap the app in <InlineCode>ThemeProvider</InlineCode>.
        </p>
        <CodeBlock
          code={DOCUMENT_SNIPPET}
          html={documentHtml}
          lang="tsx"
          title="pages/_document.tsx"
        />
        <CodeBlock code={APP_SNIPPET} html={appHtml} lang="tsx" title="pages/_app.tsx" />
      </section>

      <section className="flex flex-col gap-4">
        <h2 id="server-and-client-boundaries" className="text-headline-small text-on-surface">
          Server &amp; client boundaries
        </h2>
        <ul className="list-disc ps-6 text-body-large text-on-surface-variant">
          <li>
            Every export of <InlineCode>@windmorph/react</InlineCode>,{' '}
            <InlineCode>/primitives</InlineCode> and <InlineCode>/next</InlineCode> can be imported
            into a Server Component (checked 2026-10-13: a test page imports them all into one and
            renders it under <InlineCode>next start</InlineCode> and{' '}
            <InlineCode>next dev</InlineCode>). Interactive component files ship with{' '}
            <InlineCode>&quot;use client&quot;</InlineCode>, so a Server Component renders them as
            client components.
          </li>
          <li>
            Every function, class and constant runs on the server: <InlineCode>cn</InlineCode>,{' '}
            <InlineCode>tv</InlineCode>, <InlineCode>createTheme</InlineCode>, the theme state
            helpers (<InlineCode>getThemeFromCookies</InlineCode>,{' '}
            <InlineCode>themeAttributes</InlineCode>, <InlineCode>getThemeScriptSource</InlineCode>,
            …), the tokens, <InlineCode>getM3Spring</InlineCode>, every{' '}
            <InlineCode>*Styles</InlineCode> recipe, <InlineCode>SnackbarHostState</InlineCode> and
            the shape library. Hooks (<InlineCode>use*</InlineCode>) run only in client components.
          </li>
          <li>
            Pass only serialisable props from a Server Component: text, numbers, plain objects and
            elements such as icons. Event handlers, render functions and class instances (a{' '}
            <InlineCode>SnackbarHostState</InlineCode>,{' '}
            <InlineCode>@internationalized/date</InlineCode> values) can&apos;t cross to the client,
            so render a component that needs one (such as <InlineCode>SnackbarHost</InlineCode>)
            from a client component. Contexts such as <InlineCode>ButtonContext</InlineCode> render
            as providers from a Server Component.
          </li>
          <li>
            No <InlineCode>window</InlineCode> or <InlineCode>document</InlineCode> access at module
            load; overlays portal only on the client.
          </li>
          <li>
            Build the items of a <InlineCode>Menu</InlineCode>, <InlineCode>Select</InlineCode>,{' '}
            <InlineCode>Autocomplete</InlineCode>, <InlineCode>Tabs</InlineCode> or interactive{' '}
            <InlineCode>List</InlineCode> (<InlineCode>MenuItem</InlineCode>,{' '}
            <InlineCode>MenuGroup</InlineCode>, <InlineCode>SelectItem</InlineCode>,{' '}
            <InlineCode>Tab</InlineCode>, <InlineCode>ListItem</InlineCode>, …) in a client
            component, including a menu passed to <InlineCode>SplitButton</InlineCode>. React Aria
            reads each item&apos;s element type, and items created in a Server Component arrive as
            client references it can&apos;t read. In development the library throws an error saying
            so. A static <InlineCode>List</InlineCode> (no <InlineCode>onAction</InlineCode>,
            selection or nested items) takes its <InlineCode>ListItem</InlineCode> and{' '}
            <InlineCode>ListSection</InlineCode> elements from a Server Component.
          </li>
          <li>
            Client links are one line: <InlineCode>NextRouterProvider</InlineCode> wraps React
            Aria’s <InlineCode>RouterProvider</InlineCode> with the Next router’s{' '}
            <InlineCode>push</InlineCode>.
          </li>
        </ul>
      </section>

      <section className="flex flex-col gap-4">
        <h2 id="leaving-with-unsaved-changes" className="text-headline-small text-on-surface">
          Leaving with unsaved changes
        </h2>
        <p className="text-body-large text-on-surface-variant">
          <InlineCode>useNavigationGuard</InlineCode> asks before a page with unsaved changes is
          left. While <InlineCode>when</InlineCode> is true, library links inside{' '}
          <InlineCode>NextRouterProvider</InlineCode> call <InlineCode>onAttempt</InlineCode>{' '}
          instead of navigating: show your own confirm dialog and call{' '}
          <InlineCode>proceed()</InlineCode> if the person leaves. Reloading or closing the tab
          shows the browser&apos;s own prompt. For navigation in code, use{' '}
          <InlineCode>useGuardedNavigate()</InlineCode> instead of{' '}
          <InlineCode>router.push</InlineCode>. Plain <InlineCode>next/link</InlineCode> elements
          and the browser&apos;s Back and Forward buttons aren&apos;t covered: the App Router gives
          no way to stop them.
        </p>
        <CodeBlock code={GUARD_SNIPPET} html={guardHtml} lang="tsx" title="unsaved-changes.tsx" />
      </section>

      <section className="flex flex-col gap-4">
        <h2 id="static-export-this-site" className="text-headline-small text-on-surface">
          Static export (this site)
        </h2>
        <p className="text-body-large text-on-surface-variant">
          This documentation site uses <InlineCode>output: &apos;export&apos;</InlineCode>, so there
          is no server to read cookies. It therefore uses the script path (the{' '}
          <InlineCode>ThemeScript</InlineCode> source from{' '}
          <InlineCode>getThemeScriptSource</InlineCode>, in the root layout’s{' '}
          <InlineCode>&lt;head&gt;</InlineCode>) rather than the cookie path the Next.js playground
          app uses. Pick the cookie path when you have a server, and the script path for static or
          exported sites.
        </p>
      </section>
    </article>
  );
}
