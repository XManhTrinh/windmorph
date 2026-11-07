---
'@windmorph/react': patch
---

`ThemeProvider` no longer makes React discard server-rendered HTML streamed behind a Suspense boundary. With `mode="system"` on a dark device, the provider's context value changed right after hydration, and React client-rendered every boundary still waiting for its streamed content (a Next.js `loading.tsx` page), which could show the page twice for a moment. `useTheme()` now resolves `resolvedMode` from `prefers-color-scheme` itself, so the provider's value stays as the server rendered it. The API is unchanged.
