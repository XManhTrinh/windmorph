'use client';

import { IconButton, SearchAppBar, SearchBar } from '@windmorph/react';
import { useRef } from 'react';
import { MenuIcon, MicIcon, SearchIcon } from '../../components/icons';

/**
 * `SearchAppBar` puts a search bar in the middle of a top bar, with a navigation icon and
 * actions around it. Over its own bounded scroll container (via `scrollRef`),
 * `scrollBehavior="enter-always"` hides it on scroll down and brings it back on any scroll
 * up. The inner `SearchBar` still needs its own accessible name.
 */
export function SearchAppBarDemo() {
  const scrollRef = useRef<HTMLDivElement>(null);
  return (
    <div
      ref={scrollRef}
      className="h-[420px] w-[412px] max-w-full overflow-y-auto rounded-corner-large border border-outline-variant"
    >
      <SearchAppBar
        scrollBehavior="enter-always"
        scrollRef={scrollRef}
        navigationIcon={<IconButton icon={<MenuIcon />} aria-label="Menu" />}
        actions={<IconButton icon={<MicIcon />} aria-label="Voice search" />}
      >
        <SearchBar
          aria-label="Search"
          placeholder="Search"
          view="docked"
          leadingIcon={<SearchIcon />}
        />
      </SearchAppBar>
      {Array.from({ length: 30 }, (_, index) => (
        <p key={index} className="px-4 py-3 text-body-large text-on-surface-variant">
          Result {index + 1}
        </p>
      ))}
    </div>
  );
}
