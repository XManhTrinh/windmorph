'use client';

import {
  FloatingToolbar,
  IconButton,
  ToolbarFab,
  useToolbarScrollExpansion,
} from '@windmorph/react';
import { useRef } from 'react';
import { EditIcon, SearchIcon, SendIcon, StarIcon } from '../../components/icons';

/**
 * A floating toolbar paired with a `ToolbarFab`. `useToolbarScrollExpansion` watches the
 * bounded scroll container and collapses the toolbar after 40px of downward scroll (the
 * FAB grows), expanding it again on 40px back up. The toolbar is positioned absolutely
 * inside the relative frame, not fixed to the viewport.
 */
export function ToolbarFabScroll() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const expanded = useToolbarScrollExpansion({ scrollRef });
  return (
    <div className="relative h-[420px] w-[360px] max-w-full overflow-hidden rounded-corner-large border border-outline-variant">
      <div
        ref={scrollRef}
        tabIndex={0}
        role="region"
        aria-label="Inbox"
        className="h-full overflow-y-auto p-4"
      >
        {Array.from({ length: 40 }, (_, index) => (
          <p key={index} className="py-2 text-body-large text-on-surface-variant">
            Message {index + 1}
          </p>
        ))}
      </div>
      <FloatingToolbar
        aria-label="Message actions"
        expanded={expanded}
        className="absolute end-4 bottom-4"
        fab={<ToolbarFab icon={<EditIcon />} aria-label="Compose" />}
      >
        <IconButton icon={<SearchIcon />} aria-label="Search" />
        <IconButton icon={<StarIcon />} aria-label="Starred" />
        <IconButton icon={<SendIcon />} aria-label="Sent" />
      </FloatingToolbar>
    </div>
  );
}
