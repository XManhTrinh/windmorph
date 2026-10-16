'use client';

import { Button, TopAppBar } from '@windmorph/react';
import { SkipLink } from '@windmorph/react-pro';

/**
 * `className` goes on the fixed wrapper, the outermost element, so the skip link can show
 * below a sticky top bar instead of over it (`top-[72px]`); the link itself, the core's
 * filled `Button`, takes `classNames.link`. Click into the frame and press Tab.
 */
export function SkipLinkBelowBar() {
  return (
    <div className="relative w-full max-w-md overflow-hidden rounded-corner-large border border-outline-variant [transform:translateZ(0)]">
      <SkipLink target="example-below-bar" className="top-[72px]">
        Skip to results
      </SkipLink>
      <TopAppBar title="Search" />
      <section
        id="example-below-bar"
        aria-label="Example results"
        className="flex flex-col items-start gap-2 p-4 outline-none"
      >
        <h3 className="text-title-large text-on-surface">12 results</h3>
        <Button variant="tonal" size="sm">
          Open the first
        </Button>
      </section>
    </div>
  );
}
