'use client';

import { NavigationBar, NavigationBarItem } from '@windmorph/react';
import { useRef, useState } from 'react';
import { HomeIcon, SearchIcon, SendIcon, StarIcon } from '../../components/icons';

const DESTINATIONS = [
  { id: 'home', label: 'Home', icon: <HomeIcon /> },
  { id: 'search', label: 'Search', icon: <SearchIcon /> },
  { id: 'starred', label: 'Starred', icon: <StarIcon /> },
  { id: 'sent', label: 'Sent', icon: <SendIcon /> },
];

/**
 * `scrollBehavior="hide-on-scroll"` slides the bar off the bottom while the content scrolls
 * down and brings it back on any scroll up. The bar becomes `sticky`, so it goes last in the
 * scrolling layout; here a 420px region scrolls rather than the page, so it is passed as
 * `scrollRef`. The bar stays put under reduced motion. M3: leave this off where a screen
 * reader is in use.
 */
export function BarHideOnScroll() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState('home');
  return (
    <div className="h-[420px] w-[412px] max-w-full overflow-hidden rounded-corner-large border border-outline-variant">
      <div
        ref={scrollRef}
        tabIndex={0}
        role="region"
        aria-label="Inbox"
        className="flex h-full flex-col overflow-y-auto"
      >
        <div className="flex-1 p-4">
          {Array.from({ length: 40 }, (_, index) => (
            <p key={index} className="py-2 text-body-large text-on-surface-variant">
              Message {index + 1}
            </p>
          ))}
        </div>
        <NavigationBar
          aria-label="Hide on scroll example"
          scrollBehavior="hide-on-scroll"
          scrollRef={scrollRef}
        >
          {DESTINATIONS.map(({ id, label, icon }) => (
            <NavigationBarItem
              key={id}
              icon={icon}
              selected={current === id}
              onPress={() => setCurrent(id)}
            >
              {label}
            </NavigationBarItem>
          ))}
        </NavigationBar>
      </div>
    </div>
  );
}
