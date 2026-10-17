import { ThemeProvider } from '@windmorph/react';
import type { AppProps } from 'next/app';
import '../app/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider>
      <Component {...pageProps} />
    </ThemeProvider>
  );
}
