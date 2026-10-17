'use client';

import { useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
import { RouterProvider } from 'react-aria';
import { GuardProvider, useGuardRegistry } from './navigation-guard';

export interface NextRouterProviderProps {
  children?: ReactNode;
}

/**
 * Routes every library link (`href` on buttons, menu items, tabs, …) through the
 * Next.js router for client-side navigation, asking any active `useNavigationGuard` first.
 * Render it once inside the root layout.
 */
export function NextRouterProvider({ children }: NextRouterProviderProps) {
  const router = useRouter();
  const guards = useGuardRegistry();
  return (
    <GuardProvider value={guards}>
      <RouterProvider navigate={(href) => guards.attempt(() => router.push(href))}>
        {children}
      </RouterProvider>
    </GuardProvider>
  );
}
