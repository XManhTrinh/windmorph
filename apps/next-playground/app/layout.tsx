import { ThemeProvider } from '@windmorph/react';
import { NextRouterProvider, getThemeFromCookies, themeAttributes } from '@windmorph/react/next';
import type { Metadata } from 'next';
import { Roboto_Flex } from 'next/font/google';
import { cookies } from 'next/headers';
import type { ReactNode } from 'react';
import './globals.css';

const robotoFlex = Roboto_Flex({
  subsets: ['latin'],
  axes: ['wdth', 'opsz', 'GRAD'],
  variable: '--md-ref-typeface-brand',
  display: 'swap',
});

export const metadata: Metadata = { title: '@windmorph/react playground' };

export default async function RootLayout({ children }: { children: ReactNode }) {
  const theme = getThemeFromCookies(await cookies());
  return (
    <html lang="en" {...themeAttributes(theme)} className={robotoFlex.variable}>
      <body
        className="bg-surface text-on-surface font-plain"
        style={{ ['--md-ref-typeface-plain' as string]: 'var(--md-ref-typeface-brand)' }}
      >
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
}
