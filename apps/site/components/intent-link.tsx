'use client';

import Link from 'next/link';
import { useState, type ComponentProps, type FocusEvent, type PointerEvent } from 'react';

export type IntentLinkProps = Omit<ComponentProps<typeof Link>, 'prefetch'>;

/**
 * A `next/link` that prefetches its page once someone shows intent (pointer over it, focus,
 * or a touch starting on it) instead of when it scrolls into view. For lists of links to
 * component pages, such as the gallery and the rail, where prefetching every visible link
 * would download dozens of pages nobody opens. The prefetch still starts before the click,
 * so navigation stays instant.
 */
export function IntentLink({ onPointerEnter, onFocus, ...props }: IntentLinkProps) {
  const [intent, setIntent] = useState(false);
  return (
    <Link
      {...props}
      // `null` is Next's default prefetching, switched on once there's intent.
      prefetch={intent ? null : false}
      onPointerEnter={(event: PointerEvent<HTMLAnchorElement>) => {
        setIntent(true);
        onPointerEnter?.(event);
      }}
      onFocus={(event: FocusEvent<HTMLAnchorElement>) => {
        setIntent(true);
        onFocus?.(event);
      }}
    />
  );
}
