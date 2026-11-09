'use client';

import { NavigationRail, NavigationRailItem } from '@windmorph/react';
import { NavigationRailGroup, NavigationRailGroupItem } from '@windmorph/react-pro';
import { HomeIcon, PersonIcon, SettingsIcon } from '../../components/icons';

/** The current group's column stays open; hover or focus on another previews it over the page. */
export function NavigationRailGroupPinned() {
  return (
    <div className="relative flex h-[420px] w-full overflow-hidden rounded-corner-large bg-surface">
      <NavigationRail aria-label="Sections" className="h-full">
        <NavigationRailItem href="#demo-home" icon={<HomeIcon />}>
          Home
        </NavigationRailItem>
        <NavigationRailGroup id="reports" icon={<SettingsIcon />} label="Reports" pinned>
          <NavigationRailGroupItem href="#demo-reports-sales" current>
            Sales
          </NavigationRailGroupItem>
          <NavigationRailGroupItem href="#demo-reports-costs">Costs</NavigationRailGroupItem>
          <NavigationRailGroupItem href="#demo-reports-archive" disabled>
            Archive
          </NavigationRailGroupItem>
        </NavigationRailGroup>
        <NavigationRailGroup id="people" icon={<PersonIcon />} label="People">
          <NavigationRailGroupItem href="#demo-people-team">Team</NavigationRailGroupItem>
          <NavigationRailGroupItem href="#demo-people-hiring">Hiring</NavigationRailGroupItem>
        </NavigationRailGroup>
      </NavigationRail>
    </div>
  );
}
