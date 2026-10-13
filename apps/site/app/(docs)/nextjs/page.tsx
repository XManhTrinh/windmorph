import type { Metadata } from 'next';
import { CodeBlock } from '@windmorph/react-pro';
import { highlightSource } from '../../../lib/highlight';
import { guideMetadata } from '../../../lib/site-metadata';

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
          webpack. The library ships compiled ESM, so no{' '}
          <code className="text-on-surface">transpilePackages</code> is needed.
        </p>
      </header>

      <section className="flex flex-col gap-4">
        <h2 className="text-headline-small text-on-surface">The /next export surface</h2>
        <p className="text-body-large text-on-surface-variant">
          <code className="text-on-surface">@windmorph/react/next</code> exports{' '}
          <code className="text-on-surface">getThemeFromCookies</code> (with{' '}
          <code className="text-on-surface">CookieReader</code> and{' '}
          <code className="text-on-surface">GetThemeFromCookiesOptions</code>),{' '}
          <code className="text-on-surface">NextRouterProvider</code> (with{' '}
          <code className="text-on-surface">NextRouterProviderProps</code>),{' '}
          <code className="text-on-surface">useNavigationGuard</code> and{' '}
          <code className="text-on-surface">useGuardedNavigate</code>, and re-exports{' '}
          <code className="text-on-surface">themeAttributes</code> and the{' '}
          <code className="text-on-surface">ThemeState</code> type. Note:{' '}
          <code className="text-on-surface">ThemeScript</code> is not here — it comes from{' '}
          <code className="text-on-surface">@windmorph/react</code>.
        </p>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-headline-small text-on-surface">App Router (cookie, no flash)</h2>
        <p className="text-body-large text-on-surface-variant">
          With a server you can read the theme cookie and render the right{' '}
          <code className="text-on-surface">data-*</code> attributes on{' '}
          <code className="text-on-surface">&lt;html&gt;</code> before any JS runs, so there is no
          theme flash. The async root layout reads{' '}
          <code className="text-on-surface">getThemeFromCookies(await cookies())</code>, spreads{' '}
          <code className="text-on-surface">themeAttributes(theme)</code>, loads Roboto Flex, and
          wraps children in <code className="text-on-surface">NextRouterProvider</code> and{' '}
          <code className="text-on-surface">ThemeProvider</code>.
        </p>
        <CodeBlock
          code={APP_ROUTER_SNIPPET}
          html={appRouterHtml}
          lang="tsx"
          title="app/layout.tsx"
        />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-headline-small text-on-surface">Pages Router (script, no flash)</h2>
        <p className="text-body-large text-on-surface-variant">
          Render <code className="text-on-surface">ThemeScript</code> from{' '}
          <code className="text-on-surface">@windmorph/react</code> inside{' '}
          <code className="text-on-surface">&lt;Head&gt;</code> with{' '}
          <code className="text-on-surface">suppressHydrationWarning</code> on{' '}
          <code className="text-on-surface">&lt;Html&gt;</code>, then wrap the app in{' '}
          <code className="text-on-surface">ThemeProvider</code>.
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
        <h2 className="text-headline-small text-on-surface">Server &amp; client boundaries</h2>
        <ul className="list-disc ps-6 text-body-large text-on-surface-variant">
          <li>
            Interactive component files ship with{' '}
            <code className="text-on-surface">&quot;use client&quot;</code>; server-safe utilities (
            <code className="text-on-surface">cn</code>, tokens,{' '}
            <code className="text-on-surface">createTheme</code>,{' '}
            <code className="text-on-surface">getThemeFromCookies</code>,{' '}
            <code className="text-on-surface">getThemeScriptSource</code>) run on the server.
          </li>
          <li>
            No <code className="text-on-surface">window</code> or{' '}
            <code className="text-on-surface">document</code> access at module load; overlays portal
            only on the client.
          </li>
          <li>
            Build the items of a <code className="text-on-surface">Menu</code>,{' '}
            <code className="text-on-surface">Tabs</code> or interactive{' '}
            <code className="text-on-surface">List</code> (
            <code className="text-on-surface">MenuItem</code>,{' '}
            <code className="text-on-surface">MenuGroup</code>,{' '}
            <code className="text-on-surface">Tab</code>,{' '}
            <code className="text-on-surface">ListItem</code>) in a client component, including a
            menu passed to <code className="text-on-surface">SplitButton</code>. React Aria reads
            each item&apos;s element type, and items created in a Server Component arrive as client
            references it can&apos;t read. In development the library throws an error saying so.
          </li>
          <li>
            Client links are one line: <code className="text-on-surface">NextRouterProvider</code>{' '}
            wraps React Aria’s <code className="text-on-surface">RouterProvider</code> with the Next
            router’s <code className="text-on-surface">push</code>.
          </li>
        </ul>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-headline-small text-on-surface">Leaving with unsaved changes</h2>
        <p className="text-body-large text-on-surface-variant">
          <code className="text-on-surface">useNavigationGuard</code> asks before a page with
          unsaved changes is left. While <code className="text-on-surface">when</code> is true,
          library links inside <code className="text-on-surface">NextRouterProvider</code> call{' '}
          <code className="text-on-surface">onAttempt</code> instead of navigating: show your own
          confirm dialog and call <code className="text-on-surface">proceed()</code> if the person
          leaves. Reloading or closing the tab shows the browser&apos;s own prompt. For navigation
          in code, use <code className="text-on-surface">useGuardedNavigate()</code> instead of{' '}
          <code className="text-on-surface">router.push</code>. Plain{' '}
          <code className="text-on-surface">next/link</code> elements and the browser&apos;s Back
          and Forward buttons aren&apos;t covered: the App Router gives no way to stop them.
        </p>
        <CodeBlock code={GUARD_SNIPPET} html={guardHtml} lang="tsx" title="unsaved-changes.tsx" />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-headline-small text-on-surface">Static export (this site)</h2>
        <p className="text-body-large text-on-surface-variant">
          This documentation site uses{' '}
          <code className="text-on-surface">output: &apos;export&apos;</code>, so there is no server
          to read cookies. It therefore uses the{' '}
          <code className="text-on-surface">ThemeScript</code> path (in the root layout’s{' '}
          <code className="text-on-surface">&lt;head&gt;</code>) rather than the cookie path the
          playground uses. Pick the cookie path when you have a server, and the script path for
          static or exported sites.
        </p>
      </section>
    </article>
  );
}
