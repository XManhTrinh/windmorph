import type { Meta, StoryObj } from '@storybook/react-vite';
import { NavigationBar, NavigationBarItem } from '@windmorph/react';
import { HomeIcon, SearchIcon, StarIcon } from '../icons';
import { TokenProbe } from './probe';

const DESTINATIONS = [
  { label: 'Home', icon: <HomeIcon /> },
  { label: 'Search', icon: <SearchIcon /> },
  { label: 'Starred', icon: <StarIcon /> },
];

/** A bar whose second item is current, so the first shows the resting colours. */
function Sample({
  iconPosition,
  className,
}: {
  iconPosition: 'top' | 'start';
  className?: string;
}) {
  return (
    <NavigationBar
      aria-label={`Bar ${iconPosition}`}
      iconPosition={iconPosition}
      className={className}
    >
      {DESTINATIONS.map(({ label, icon }, index) => (
        <NavigationBarItem key={label} icon={icon} selected={index === 1}>
          {label}
        </NavigationBarItem>
      ))}
    </NavigationBar>
  );
}

/** The navigation bar's component tokens, probed by e2e/component-tokens.spec.ts. */
const meta = {
  title: 'Tokens/md-comp-nav-bar',
  tags: ['tokens-probe'],
} satisfies Meta;

export default meta;

export const Probe: StoryObj = {
  render: () => (
    <TokenProbe
      instances={
        <>
          <Sample iconPosition="top" />
          <Sample iconPosition="start" />
        </>
      }
      scoped={<Sample iconPosition="top" />}
      override={{
        token: '--md-comp-nav-bar-container-color',
        children: <Sample iconPosition="top" className="bg-tertiary" />,
      }}
    />
  ),
};
