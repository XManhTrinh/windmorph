import { DEFAULT_THEME_STATE, ThemeProvider, getThemeScriptSource } from '@windmorph/react';
import { NextRouterProvider } from '@windmorph/react/next';
import type { Metadata } from 'next';
import { Roboto_Flex } from 'next/font/google';
import type { ReactNode } from 'react';
import { InlineScript } from '../components/inline-script';
import { SITE_NAME, siteUrl } from '../lib/site-metadata';
import { SITE_DEFAULT_THEME, SITE_THEMES } from '../lib/site-themes';
import { DocsShell } from './(docs)/docs-shell';
import { componentSearchEntry, GUIDE_ENTRIES, type SearchEntry } from './(docs)/search-index';
import { COMPONENT_PAGES } from '../content/components/registry';
import { componentTabs } from '../lib/component-page';
import { DIRECTION_SCRIPT } from './direction';
import './globals.css';

const robotoFlex = Roboto_Flex({
  subsets: ['latin'],
  axes: ['wdth', 'opsz', 'GRAD'],
  variable: '--md-ref-typeface-brand',
  display: 'swap',
});

const DESCRIPTION =
  'Windmorph (@windmorph/react) is a React component library for Material Design 3 Expressive: accessible components, themes, springs and shapes, with docs and live examples.';

export const metadata: Metadata = {
  metadataBase: siteUrl(),
  title: {
    default: `${SITE_NAME}: Material 3 Expressive for React`,
    template: `%s · ${SITE_NAME}`,
  },
  description: DESCRIPTION,
  applicationName: SITE_NAME,
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    title: `${SITE_NAME}: Material 3 Expressive for React`,
    description: DESCRIPTION,
    url: '/',
  },
};

/**
 * The search index is built here, on the server, because the component registry imports
 * page bodies that read example source from disk. Building it in the root layout lets the
 * one shell (top bar + rail) wrap every route, the homepage included.
 */
async function searchEntries(): Promise<SearchEntry[]> {
  const components = await Promise.all(
    COMPONENT_PAGES.map(async (page) => componentSearchEntry(page, await componentTabs(page))),
  );
  return [...GUIDE_ENTRIES, ...components];
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={robotoFlex.variable}>
      <head>
        {/*
         * Pre-paint theme + direction init. `InlineScript` runs synchronously in <head>
         * before first paint (server renders it as executable `text/javascript`), so the
         * stored theme/mode/contrast/direction are applied with no flash on the static export
         * — home and component pages alike — while rendering inert on the client so React 19
         * doesn't warn about a script tag. The theme source is the library's
         * `getThemeScriptSource`; the core `ThemeScript` is left untouched.
         */}
        <InlineScript
          html={getThemeScriptSource({
            defaults: { ...DEFAULT_THEME_STATE, theme: SITE_DEFAULT_THEME },
          })}
        />
        <InlineScript html={DIRECTION_SCRIPT} />
      </head>
      <body
        className="bg-surface text-on-surface font-plain"
        style={{ ['--md-ref-typeface-plain' as string]: 'var(--md-ref-typeface-brand)' }}
      >
        <NextRouterProvider>
          <ThemeProvider
            themes={SITE_THEMES}
            defaultTheme={SITE_DEFAULT_THEME}
            defaultMode={DEFAULT_THEME_STATE.mode}
            defaultContrast={DEFAULT_THEME_STATE.contrast}
            defaultMotion={DEFAULT_THEME_STATE.motion}
          >
            <DocsShell searchEntries={await searchEntries()}>{children}</DocsShell>
          </ThemeProvider>
        </NextRouterProvider>
      </body>
    </html>
  );
}
