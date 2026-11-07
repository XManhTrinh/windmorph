---
'@windmorph/react': patch
---

`ThemeProvider` warns in development when it hydrates with the server's theme while streamed Suspense boundaries are still pending, then applies a different saved selection. That change makes React render those boundaries on the client and drop their server HTML. The warning names the values and the fix: with a streaming server, read the cookie with `getThemeFromCookies` and pass every value as a `default*` prop. The Next.js guide's App Router example now passes `defaultDensity` too.
