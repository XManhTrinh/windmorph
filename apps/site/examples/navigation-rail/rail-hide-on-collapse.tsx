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
 * Hidden while collapsed: with `modal` and `hideOnCollapse`, the collapsed rail takes no
 * room at all, and the expanded rail slides in over the page. The page's own menu button
 * opens it through the controlled `expanded` prop.
 */
export function RailHideOnCollapse() {
  const [expanded, setExpanded] = useState(false);
  const [current, setCurrent] = useState('home');
  return (
    <div className="flex h-[360px] w-full overflow-hidden rounded-corner-large border border-outline-variant">
      <NavigationRail
        aria-label="Shortcuts"
        modal
        hideOnCollapse
        expanded={expanded}
        onExpandedChange={setExpanded}
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
      <div className="flex flex-1 flex-col items-start gap-2 bg-surface-container-low p-4 text-body-large text-on-surface-variant">
        <IconButton
          variant="standard"
          icon={<MenuIcon />}
          aria-label="Open navigation"
          onPress={() => setExpanded(true)}
        />
        <p className="px-2">Current: {current}</p>
      </div>
    </div>
  );
}
