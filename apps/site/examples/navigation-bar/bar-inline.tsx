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
 * (`iconPosition="start"`) and `arrangement="centered"` groups the items within side
 * padding instead of spreading them across the full width.
 */
export function BarInline() {
  const [current, setCurrent] = useState('home');
  return (
    <div className="w-full overflow-hidden rounded-corner-large border border-outline-variant">
      <NavigationBar aria-label="Inline example" iconPosition="start" arrangement="centered">
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
