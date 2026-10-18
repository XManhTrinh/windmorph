'use client';

import { IconButton, TopAppBar } from '@windmorph/react';
import { useRef } from 'react';
import { ArrowBackIcon, ShareIcon } from '../../components/icons';

/**
 * `scrolledColor="transparent"`: instead of filling with `surface-container`, the bar
 * fades to see-through as content scrolls under it, so a photo or map stays in view. The
 * icon buttons get a container fill (`tonal`) so they stay legible over the content. With
 * no title, nothing overlaps the content but the buttons.
 */
export function TopAppBarTransparent() {
  const scrollRef = useRef<HTMLDivElement>(null);
  return (
    <div
      ref={scrollRef}
      className="h-[420px] w-[412px] max-w-full overflow-y-auto rounded-corner-large border border-outline-variant"
    >
      <TopAppBar
        title=""
        navigationIcon={<IconButton variant="tonal" icon={<ArrowBackIcon />} aria-label="Back" />}
        actions={<IconButton variant="tonal" icon={<ShareIcon />} aria-label="Share" />}
        scrollBehavior="pinned"
        scrolledColor="transparent"
        scrollRef={scrollRef}
      />
      <div className="mx-4 h-[220px] rounded-corner-large bg-tertiary-container" />
      <h2 className="px-4 pt-4 text-headline-small text-on-surface">Street food stall</h2>
      {Array.from({ length: 12 }, (_, index) => (
        <p key={index} className="px-4 py-3 text-body-large text-on-surface-variant">
          Review {index + 1}: grilled pork, fresh herbs and a bright dipping sauce.
        </p>
      ))}
    </div>
  );
}
