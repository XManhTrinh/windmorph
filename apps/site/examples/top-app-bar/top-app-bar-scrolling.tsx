'use client';

import { IconButton, TopAppBar } from '@windmorph/react';
import { useRef } from 'react';
import { ArrowBackIcon, MoreVertIcon, StarIcon } from '../../components/icons';

/**
 * A medium bar over its own scroll container. `scrollRef` points the bar at that bounded
 * container (not the window), and `scrollBehavior="exit-until-collapsed"` collapses the
 * large title into the top row and turns the bar `surface-container` as the content
 * scrolls under it. Scroll the panel to watch it collapse.
 */
export function TopAppBarScrolling() {
  const scrollRef = useRef<HTMLDivElement>(null);
  return (
    <div
      ref={scrollRef}
      className="h-[420px] w-[412px] max-w-full overflow-y-auto rounded-corner-large border border-outline-variant"
    >
      <TopAppBar
        variant="medium"
        title="Inbox"
        subtitle="24 messages"
        navigationIcon={<IconButton icon={<ArrowBackIcon />} aria-label="Back" />}
        actions={
          <>
            <IconButton icon={<StarIcon />} aria-label="Favourite" />
            <IconButton icon={<MoreVertIcon />} aria-label="More" />
          </>
        }
        scrollBehavior="exit-until-collapsed"
        scrollRef={scrollRef}
      />
      {Array.from({ length: 30 }, (_, index) => (
        <p key={index} className="px-4 py-3 text-body-large text-on-surface-variant">
          Message {index + 1}
        </p>
      ))}
    </div>
  );
}
