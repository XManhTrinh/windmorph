'use client';

import { IconButton, NavigationRail, NavigationRailItem } from '@windmorph/react';
import { useState } from 'react';
import { HomeIcon, MenuIcon, SearchIcon, SendIcon, StarIcon } from '../../components/icons';

const DESTINATIONS = [
  { id: 'home', label: 'Home', icon: <HomeIcon /> },
  { id: 'search', label: 'Search', icon: <SearchIcon /> },
  { id: 'starred', label: 'Starred', icon: <StarIcon /> },
  { id: 'sent', label: 'Sent', icon: <SendIcon /> },
];

/**
 * The modal expanded layout: with `modal`, expanding the rail opens it over the page as a
 * sheet with a scrim, instead of pushing the content aside. Choosing a destination, Escape
 * or a press on the scrim collapses it again. Use it where the window is too narrow to give
 * the expanded rail room beside the content.
 */
export function RailModal() {
  const [current, setCurrent] = useState('home');
  return (
    <div className="flex h-[360px] w-full overflow-hidden rounded-corner-large border border-outline-variant">
      <NavigationRail
        aria-label="Accounts"
        modal
        header={({ expanded, toggle }) => (
          <IconButton
            variant="standard"
            icon={<MenuIcon />}
            aria-label={expanded ? 'Collapse navigation' : 'Expand navigation'}
            onPress={toggle}
          />
        )}
      >
        {DESTINATIONS.map(({ id, label, icon }) => (
          <NavigationRailItem
            key={id}
            icon={icon}
            selected={current === id}
            onPress={() => setCurrent(id)}
          >
            {label}
          </NavigationRailItem>
        ))}
      </NavigationRail>
      <div className="flex-1 bg-surface-container-low p-6 text-body-large text-on-surface-variant">
        Current: {current}
      </div>
    </div>
  );
}
