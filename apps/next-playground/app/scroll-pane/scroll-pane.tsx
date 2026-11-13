'use client';

import { useScrollKeys, useScrollRestoration } from '@windmorph/react/primitives';
import { usePathname } from 'next/navigation';
import { useRef, type ReactNode } from 'react';

/**
 * A page that is a pane scrolling by itself, as in an app frame, on the App Router: the window
 * never scrolls, so the browser has no scroll position to restore. `useScrollRestoration` keeps
 * the pane's per page, and `useScrollKeys` sends it the scroll keys while nothing has focus.
 *
 * The page `plain` is laid out without the pane, as a frame can lay out its public pages: the
 * hooks stay mounted while the element behind their ref goes, and comes back as a new one.
 */
export function ScrollPane({ children }: { children: ReactNode }) {
  const pane = useRef<HTMLElement>(null);
  const { tabIndex } = useScrollKeys(pane);
  const pathname = usePathname() ?? '';
  useScrollRestoration(pane, { pageKey: pathname });
  if (pathname.endsWith('/plain')) {
    return (
      <main data-testid="plain" className="bg-surface">
        {children}
      </main>
    );
  }
  return (
    <div className="fixed inset-0 flex bg-surface">
      <main
        ref={pane}
        tabIndex={tabIndex}
        data-testid="pane"
        className="min-w-0 flex-1 overflow-y-auto outline-none"
      >
        {children}
      </main>
      {/* A side panel that scrolls by itself and takes no focus, as a side sheet's content: after
          a press in it the browser sends it the scroll keys, and the pane leaves them there. */}
      <aside data-testid="side" className="w-[240px] shrink-0 overflow-y-auto p-4">
        {Array.from({ length: 80 }, (_, index) => (
          <p key={index} className="m-0 text-body-medium">
            Side note {index + 1}
          </p>
        ))}
      </aside>
    </div>
  );
}
