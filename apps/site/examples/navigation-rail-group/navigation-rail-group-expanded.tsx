'use client';

import { IconButton, NavigationRail } from '@windmorph/react';
import { NavigationRailGroup, NavigationRailGroupItem } from '@windmorph/react-pro';
import { useState } from 'react';
import { MenuIcon, PersonIcon, SettingsIcon } from '../../components/icons';

/** In an expanded rail, or its modal sheet on a phone, the same groups fold as an accordion. */
export function NavigationRailGroupExpanded() {
  const [expanded, setExpanded] = useState(true);
  return (
    <div className="flex h-[420px] w-full overflow-hidden rounded-corner-large bg-surface">
      <NavigationRail
        aria-label="Expanded sections"
        className="h-full"
        expanded={expanded}
        onExpandedChange={setExpanded}
        header={({ toggle }) => (
          <IconButton variant="standard" icon={<MenuIcon />} aria-label="Menu" onPress={toggle} />
        )}
      >
        <NavigationRailGroup
          id="reports"
          icon={<SettingsIcon />}
          label="Reports"
          currentPath="/reports/sales"
        >
          <NavigationRailGroupItem href="/reports/sales">Sales</NavigationRailGroupItem>
          <NavigationRailGroupItem href="/reports/costs">Costs</NavigationRailGroupItem>
        </NavigationRailGroup>
        <NavigationRailGroup id="people" icon={<PersonIcon />} label="People">
          <NavigationRailGroupItem href="/people/team">Team</NavigationRailGroupItem>
        </NavigationRailGroup>
      </NavigationRail>
    </div>
  );
}
