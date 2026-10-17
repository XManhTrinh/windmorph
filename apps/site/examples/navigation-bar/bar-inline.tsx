'use client';

import { NavigationBar, NavigationBarItem } from '@windmorph/react';
import { useState } from 'react';
import { HomeIcon, SearchIcon, SendIcon, StarIcon } from '../../components/icons';

const DESTINATIONS = [
  { id: 'home', label: 'Home', icon: <HomeIcon /> },
  { id: 'search', label: 'Search', icon: <SearchIcon /> },
  { id: 'starred', label: 'Starred', icon: <StarIcon /> },
  { id: 'sent', label: 'Sent', icon: <SendIcon /> },
];

/**
 * The flexible bar for medium windows: the icon sits beside the label in a pill
 * (`iconPosition="start"`). These items keep their own width and are centred, with the
 * extra space at the bar's ends.
 */
export function BarInline() {
  const [current, setCurrent] = useState('home');
  return (
    <div className="w-full overflow-hidden rounded-corner-large border border-outline-variant">
      <NavigationBar aria-label="Inline example" iconPosition="start">
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
  );
}
