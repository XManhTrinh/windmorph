'use client';

import { Button } from '@windmorph/react';
import { SkipLink } from '@windmorph/react-pro';

/**
 * Click into the frame and press Tab: "Skip to content" appears; Enter moves focus past the
 * navigation, so the next Tab reaches "Read more". (Here it sits in the frame, not the page,
 * and the frame's content is a plain section: a page has only one `main`.)
 */
export function SkipLinkPage() {
  return (
    <div className="relative w-full max-w-md overflow-hidden rounded-corner-large border border-outline-variant [transform:translateZ(0)]">
      <SkipLink target="example-main">Skip to content</SkipLink>
      <nav aria-label="Example" className="flex flex-wrap gap-2 bg-surface-container p-4">
        {['Home', 'Shops', 'Jobs', 'Homes'].map((item) => (
          <Button key={item} variant="text" size="sm">
            {item}
          </Button>
        ))}
      </nav>
      <section
        id="example-main"
        aria-label="Example content"
        className="flex flex-col items-start gap-2 p-4 outline-none"
      >
        <h3 className="text-title-large text-on-surface">Today in Leeds</h3>
        <Button variant="tonal" size="sm">
          Read more
        </Button>
      </section>
    </div>
  );
}
