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
  /**
   * The app's `trailingSlash` (from `next.config`), so a link's address ends as Next's own
   * `Link` writes it: `true` adds a `/` to a path on this site (not to a file's, such as
   * `/report.pdf`). Given either prop, a path ends as Next writes it, so with `basePath` alone
   * `/` is the base path itself (`/docs`, not `/docs/`).
   * @default false
   */
  trailingSlash?: boolean;
}

// A path on this site written as Next's `Link` writes it (its `addBasePath`): the base path in
// front, then a trailing slash only when `trailingSlash` asks for one, never after a file's
// name. A fragment, a query alone and a full URL stay as they are.
function nextHref(basePath = '', trailingSlash = false) {
  const base = basePath.replace(/\/+$/, '');
  return (href: string) => {
    if (!href.startsWith('/') || href.startsWith('//')) return href;
    const split = href.search(/[?#]/);
    const rest = split === -1 ? '' : href.slice(split);
    const path = (base + (split === -1 ? href : href.slice(0, split))).replace(/\/+$/, '');
    if (trailingSlash && !/\.[^/]+$/.test(path)) return `${path}/${rest}`;
    return `${path || '/'}${rest}`;
  };
}

/**
 * Routes every library link (`href` on buttons, menu items, tabs, …) through the
 * Next.js router for client-side navigation, asking any active `useNavigationGuard` first.
 * Render it once inside the root layout.
 */
export function NextRouterProvider({ children, basePath, trailingSlash }: NextRouterProviderProps) {
  const router = useRouter();
  const guards = useGuardRegistry();
  return (
    <GuardProvider value={guards}>
      <RouterProvider
        navigate={(href) => guards.attempt(() => router.push(href))}
        useHref={basePath || trailingSlash ? nextHref(basePath, trailingSlash) : undefined}
      >
        {children}
      </RouterProvider>
    </GuardProvider>
  );
}
