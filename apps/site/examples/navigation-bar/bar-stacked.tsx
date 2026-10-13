'use client';

import { Badge, NavigationBar, NavigationBarItem } from '@windmorph/react';
import { useState } from 'react';
import { HomeIcon, SearchIcon, SendIcon, StarIcon } from '../../components/icons';

const DESTINATIONS = [
  { id: 'home', label: 'Home', icon: <HomeIcon /> },
  { id: 'search', label: 'Search', icon: <SearchIcon /> },
  { id: 'starred', label: 'Starred', icon: <StarIcon /> },
  { id: 'sent', label: 'Sent', icon: <SendIcon /> },
];

/**
 * The compact navigation bar: 3–5 destinations with the icon stacked above the label
 * (`iconPosition="top"`, the default). It is normally fixed to the bottom of the window;
 * here it sits in a bounded 412px frame. Each item marks the current destination with
 * `selected`, and a `badge` on Search shows a count on its icon, described to assistive
 * tech by `badgeLabel`.
 */
export function BarStacked() {
  const [current, setCurrent] = useState('home');
  return (
    <div className="w-[412px] max-w-full overflow-hidden rounded-corner-large border border-outline-variant">
      <NavigationBar aria-label="Stacked example">
        {DESTINATIONS.map(({ id, label, icon }) => (
          <NavigationBarItem
            key={id}
            icon={icon}
            {...(id === 'search' && { badge: <Badge>3</Badge>, badgeLabel: '3 new results' })}
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
