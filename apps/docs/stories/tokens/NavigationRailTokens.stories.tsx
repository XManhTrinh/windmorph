import type { Meta, StoryObj } from '@storybook/react-vite';
import { cn, NavigationRail, NavigationRailItem } from '@windmorph/react';
import { HomeIcon, SearchIcon, StarIcon } from '../icons';
import { TokenProbe } from './probe';

const DESTINATIONS = [
  { label: 'Home', icon: <HomeIcon /> },
  { label: 'Search', icon: <SearchIcon /> },
  { label: 'Starred', icon: <StarIcon /> },
];

/** A rail whose second item is current, so the first shows the resting colours. */
function Sample({
  label,
  expanded = false,
  modal = false,
  className,
}: {
  label: string;
  expanded?: boolean;
  modal?: boolean;
  className?: string;
}) {
  return (
    <NavigationRail
      aria-label={label}
      expanded={expanded}
      modal={modal}
      className={cn('h-[280px]', className)}
    >
      {DESTINATIONS.map(({ label: name, icon }, index) => (
        <NavigationRailItem key={name} icon={icon} selected={index === 1}>
          {name}
        </NavigationRailItem>
      ))}
    </NavigationRail>
  );
}

/** The navigation rail's component tokens, probed by e2e/component-tokens.spec.ts. */
const meta = {
  title: 'Tokens/md-comp-nav-rail',
  tags: ['tokens-probe'],
} satisfies Meta;

export default meta;

/** Collapsed, expanded, and modal with its sheet open. */
export const Probe: StoryObj = {
  render: () => (
    <TokenProbe
      instances={
        <div className="flex gap-4">
          <Sample label="Collapsed" />
          <Sample label="Expanded" expanded />
          <Sample label="Modal" modal expanded />
        </div>
      }
      scoped={<Sample label="Scoped" />}
      override={{
        token: '--md-comp-nav-rail-collapsed-container-color',
        children: <Sample label="Override" className="bg-tertiary" />,
      }}
    />
  ),
};
