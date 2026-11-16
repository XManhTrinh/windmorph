'use client';

import { NavigationBar, NavigationBarItem } from '@windmorph/react';
import type { ReactElement } from 'react';
import {
  CalendarMonthIcon,
  HomeIcon,
  SearchIcon,
  SendIcon,
  SettingsIcon,
  StarIcon,
} from '../../components/icons';

interface Destination {
  label: string;
  icon: ReactElement;
}

const FOUR: Destination[] = [
  { label: 'Home', icon: <HomeIcon /> },
  { label: 'Search', icon: <SearchIcon /> },
  { label: 'Starred', icon: <StarIcon /> },
  { label: 'Sent', icon: <SendIcon /> },
];

const SIX: Destination[] = [
  ...FOUR,
  { label: 'Calendar', icon: <CalendarMonthIcon /> },
  { label: 'Settings', icon: <SettingsIcon /> },
];

function Bar({ items, current }: { items: Destination[]; current: readonly string[] }) {
  return (
    <div className="w-full max-w-96 overflow-hidden rounded-corner-large border border-outline-variant">
      <NavigationBar aria-label="Example">
        {items.map(({ label, icon }) => (
          <NavigationBarItem key={label} icon={icon} current={current.includes(label)}>
            {label}
          </NavigationBarItem>
        ))}
      </NavigationBar>
    </div>
  );
}

/** Do: three to five destinations. */
export function NavigationBarDoFour() {
  return <Bar items={FOUR} current={['Home']} />;
}

/** Don't: more than five destinations. */
export function NavigationBarDontSix() {
  return <Bar items={SIX} current={['Home']} />;
}

/** Do: the active indicator on the current destination only. */
export function NavigationBarDoOneActive() {
  return <Bar items={FOUR} current={['Search']} />;
}

/** Don't: the active indicator on several destinations. */
export function NavigationBarDontManyActive() {
  return <Bar items={FOUR} current={['Home', 'Starred']} />;
}
