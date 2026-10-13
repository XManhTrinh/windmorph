import { Badge, NavigationRail, NavigationRailItem } from '@windmorph/react';
import { HomeIcon, SearchIcon, SendIcon, StarIcon, StarOutlineIcon } from '../../components/icons';

const DESTINATIONS = [
  { id: 'home', label: 'Home', icon: <HomeIcon /> },
  { id: 'search', label: 'Search', icon: <SearchIcon /> },
  { id: 'starred', label: 'Starred', icon: <StarOutlineIcon />, selectedIcon: <StarIcon /> },
  { id: 'sent', label: 'Sent mail', icon: <SendIcon /> },
];

/**
 * The collapsed and expanded layouts side by side. Collapsed, items stack the icon above
 * the label; expanded, the icon sits beside the label. A `selectedIcon` can swap in while
 * an item is selected, and a disabled item is skipped by the keyboard. A `badge` sits on
 * the icon while collapsed and after the label while expanded, and `divider` marks the
 * edge next to the content.
 */
export function RailStates() {
  return (
    <div className="flex gap-6">
      {[false, true].map((expanded) => (
        <div
          key={String(expanded)}
          className="h-[360px] overflow-hidden rounded-corner-large border border-outline-variant"
        >
          <NavigationRail
            aria-label={expanded ? 'Expanded example' : 'Collapsed example'}
            expanded={expanded}
            divider
            className="h-full"
          >
            {DESTINATIONS.map(({ id, label, icon, selectedIcon }, index) => (
              <NavigationRailItem
                key={id}
                icon={icon}
                selectedIcon={selectedIcon}
                {...(id === 'search' && { badge: <Badge>3</Badge>, badgeLabel: '3 new results' })}
                selected={index === 2}
                disabled={index === 3}
              >
                {label}
              </NavigationRailItem>
            ))}
          </NavigationRail>
        </div>
      ))}
    </div>
  );
}
