import { DEFAULT_THEME_STATE, ThemeProvider, getThemeScriptSource } from '@windmorph/react';
import { NextRouterProvider } from '@windmorph/react/next';
import type { Metadata } from 'next';
import { Roboto_Flex } from 'next/font/google';
import type { ReactNode } from 'react';
import { InlineScript } from '../components/inline-script';
import {
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TITLE,
  SITE_URL,
  pageMetadata,
} from '../lib/site-metadata';
import { SITE_DEFAULT_THEME, SITE_THEMES } from '../lib/site-themes';
import { DocsShell } from './(docs)/docs-shell';
import { DIRECTION_SCRIPT } from './direction';
import './globals.css';

const robotoFlex = Roboto_Flex({
  subsets: ['latin'],
  axes: ['wdth', 'opsz', 'GRAD'],
  variable: '--md-ref-typeface-brand',
  display: 'swap',
});

/**
 * The site's defaults: every page sets its own title, description, canonical URL and link
 * previews through `pageMetadata`; these are the home page's, and the title template.
 */
export const metadata: Metadata = {
  ...pageMetadata(SITE_TITLE, SITE_DESCRIPTION, '/'),
  metadataBase: new URL(SITE_URL),
  title: { default: SITE_TITLE, template: `%s · ${SITE_NAME}` },
  applicationName: SITE_NAME,
};

export default function RootLayout({ children }: { children: ReactNode }) {
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
            <DocsShell>{children}</DocsShell>
          </ThemeProvider>
        </NextRouterProvider>
      </body>
    </html>
  );
}
