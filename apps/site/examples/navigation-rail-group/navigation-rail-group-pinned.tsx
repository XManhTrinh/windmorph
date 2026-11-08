'use client';

import { NavigationRail, NavigationRailItem } from '@windmorph/react';
import { NavigationRailGroup, NavigationRailGroupItem } from '@windmorph/react-pro';
import { useState } from 'react';
import { HomeIcon, PersonIcon, SettingsIcon } from '../../components/icons';

/** The current group's column stays open; hover or focus on another previews it over the page. */
export function NavigationRailGroupPinned() {
  const [path] = useState('/reports/costs');
  return (
    <div className="relative flex h-[420px] w-full overflow-hidden rounded-corner-large bg-surface">
      <NavigationRail aria-label="Sections" className="h-full">
        <NavigationRailItem href="#home" icon={<HomeIcon />}>
          Home
        </NavigationRailItem>
        <NavigationRailGroup
          id="reports"
          icon={<SettingsIcon />}
          label="Reports"
          currentPath={path}
          pinned
        >
          <NavigationRailGroupItem href="/reports/sales">Sales</NavigationRailGroupItem>
          <NavigationRailGroupItem href="/reports/costs">Costs</NavigationRailGroupItem>
          <NavigationRailGroupItem href="/reports/archive" disabled>
            Archive
          </NavigationRailGroupItem>
        </NavigationRailGroup>
        <NavigationRailGroup id="people" icon={<PersonIcon />} label="People" currentPath={path}>
          <NavigationRailGroupItem href="/people/team">Team</NavigationRailGroupItem>
          <NavigationRailGroupItem href="/people/hiring">Hiring</NavigationRailGroupItem>
        </NavigationRailGroup>
      </NavigationRail>
    </div>
  );
}
