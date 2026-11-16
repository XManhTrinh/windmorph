'use client';

// With its extension: Next has no `exports` map, so plain Node ESM resolves only the file.
import { useRouter } from 'next/navigation.js';
import type { ReactNode } from 'react';
import { RouterProvider } from 'react-aria';
import { GuardProvider, useGuardRegistry } from './navigation-guard';

export interface NextRouterProviderProps {
  children?: ReactNode;
  /**
   * The app's `basePath` (from `next.config`), so a link's address shows it, as Next's own
   * `Link` does: a path starting with `/` gets it in front, while `#fragment`s and full URLs
   * stay as they are. Navigation goes through the router, which adds it itself.
   */
  basePath?: string;
}

// A path on this site gets the base path; a fragment, a query alone or a full URL doesn't.
function withBasePath(basePath: string) {
  const base = basePath.replace(/\/+$/, '');
  return (href: string) => (href.startsWith('/') && !href.startsWith('//') ? base + href : href);
}

/**
 * Routes every library link (`href` on buttons, menu items, tabs, …) through the
 * Next.js router for client-side navigation, asking any active `useNavigationGuard` first.
 * Render it once inside the root layout.
 */
export function NextRouterProvider({ children, basePath }: NextRouterProviderProps) {
  const router = useRouter();
  const guards = useGuardRegistry();
  return (
    <GuardProvider value={guards}>
      <RouterProvider
        navigate={(href) => guards.attempt(() => router.push(href))}
        useHref={basePath ? withBasePath(basePath) : undefined}
      >
        {children}
      </RouterProvider>
    </GuardProvider>
  );
}
