'use client';

import { Badge, NavigationBar, NavigationBarItem } from '@windmorph/react';
import { useState } from 'react';
import { HomeIcon, NotificationsIcon, SendIcon, StarIcon } from '../../components/icons';

/**
 * Badges on navigation items, their main use: the item's `badge` places it on the icon, at
 * its upper trailing edge. A dot says something is new, a count how many, capped at four
 * characters ("999+"). `badgeLabel` tells assistive tech what the badge means.
 */
export function BadgeNavigation() {
  const [current, setCurrent] = useState('home');
  const items = [
    { id: 'home', label: 'Home', icon: <HomeIcon /> },
    {
      id: 'messages',
      label: 'Messages',
      icon: <SendIcon />,
      badge: <Badge>{3}</Badge>,
      badgeLabel: '3 unread messages',
    },
    {
      id: 'activity',
      label: 'Activity',
      icon: <NotificationsIcon />,
      badge: <Badge>{1200}</Badge>,
      badgeLabel: 'More than 999 notifications',
    },
    {
      id: 'saved',
      label: 'Saved',
      icon: <StarIcon />,
      badge: <Badge />,
      badgeLabel: 'New saved posts',
    },
  ];
  return (
    <div className="w-full overflow-hidden rounded-corner-large border border-outline-variant">
      <NavigationBar aria-label="Badges example">
        {items.map(({ id, label, icon, badge, badgeLabel }) => (
          <NavigationBarItem
            key={id}
            icon={icon}
            badge={badge}
            badgeLabel={badgeLabel}
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
