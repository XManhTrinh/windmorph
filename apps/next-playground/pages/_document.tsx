import { ThemeScript } from '@windmorph/react';
import { Head, Html, Main, NextScript } from 'next/document';

/** Pages Router: ThemeScript applies the stored theme before first paint. */
export default function Document() {
  return (
    <Html lang="en" suppressHydrationWarning>
      <Head>
        <ThemeScript />
      </Head>
      <body className="bg-surface text-on-surface font-plain">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
