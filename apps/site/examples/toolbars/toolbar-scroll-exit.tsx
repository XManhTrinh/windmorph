'use client';

import { DockedToolbar, IconButton, useToolbarScrollExit } from '@windmorph/react';
import { useRef } from 'react';
import { EditIcon, SearchIcon, SendIcon, StarIcon } from '../../components/icons';

/**
 * `useToolbarScrollExit` slides the toolbar off the bottom edge after 40px of downward
 * scroll and brings it back after 40px up; pass it to the toolbar's `visible`. A hidden
 * toolbar is `inert`, and reduced motion fades it instead. Use it or
 * `useToolbarScrollExpansion`, not both: M3 says a toolbar shouldn't both collapse and
 * leave the screen.
 */
export function ToolbarScrollExit() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const visible = useToolbarScrollExit({ scrollRef });
  return (
    <div className="relative h-[420px] w-[360px] max-w-full overflow-hidden rounded-corner-large border border-outline-variant">
      <div
        ref={scrollRef}
        tabIndex={0}
        role="region"
        aria-label="Messages"
        className="h-full overflow-y-auto p-4 pb-20"
      >
        {Array.from({ length: 40 }, (_, index) => (
          <p key={index} className="py-2 text-body-large text-on-surface-variant">
            Message {index + 1}
          </p>
        ))}
      </div>
      <DockedToolbar
        aria-label="Message actions"
        visible={visible}
        className="absolute inset-x-0 bottom-0"
      >
        <IconButton icon={<SearchIcon />} aria-label="Search" />
        <IconButton icon={<StarIcon />} aria-label="Starred" />
        <IconButton icon={<SendIcon />} aria-label="Sent" />
        <IconButton variant="filled" icon={<EditIcon />} aria-label="Compose" />
      </DockedToolbar>
    </div>
  );
}
