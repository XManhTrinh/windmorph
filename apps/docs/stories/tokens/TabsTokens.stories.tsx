import type { Meta, StoryObj } from '@storybook/react-vite';
import { Tab, Tabs, type TabsVariant } from '@windmorph/react';
import { HomeIcon, SearchIcon, StarIcon } from '../icons';
import { TokenProbe } from './probe';

const VARIANTS: TabsVariant[] = ['primary', 'secondary'];

/** Tabs with icons and labels, the second selected, so the first shows the resting colours. */
function Sample({ variant, className }: { variant: TabsVariant; className?: string }) {
  return (
    <Tabs
      aria-label={`${variant} tabs`}
      variant={variant}
      defaultSelectedKey="search"
      classNames={className ? { list: className } : undefined}
    >
      <Tab key="home" title="Home" icon={<HomeIcon />} />
      <Tab key="search" title="Search" icon={<SearchIcon />} />
      <Tab key="starred" title="Starred" icon={<StarIcon />} />
    </Tabs>
  );
}

/** The tabs' component tokens, probed by e2e/component-tokens.spec.ts. */
const meta = {
  title: 'Tokens/md-comp-tabs',
  tags: ['tokens-probe'],
} satisfies Meta;

export default meta;

export const Probe: StoryObj = {
  render: () => (
    <TokenProbe
      instances={VARIANTS.map((variant) => (
        <Sample key={variant} variant={variant} />
      ))}
      scoped={<Sample variant="primary" />}
      override={{
        token: '--md-comp-primary-navigation-tab-container-color',
        children: <Sample variant="primary" className="bg-tertiary" />,
      }}
    />
  ),
};
