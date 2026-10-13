import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Fab,
  IconButton,
  NavigationBar,
  NavigationBarItem,
  NavigationRail,
  NavigationRailItem,
} from '@windmorph/react';
import { useState } from 'react';
import { EditIcon, HomeIcon, MenuIcon, SearchIcon, SendIcon, StarIcon } from './icons';
import {
  LAYOUT_OVERRIDES,
  LAYOUT_OVERRIDE_NAMES,
  type LayoutOverrideName,
} from './layout-overrides';

const DESTINATIONS = [
  { id: 'home', label: 'Home', icon: <HomeIcon /> },
  { id: 'search', label: 'Search', icon: <SearchIcon /> },
  { id: 'starred', label: 'Starred', icon: <StarIcon /> },
  { id: 'sent', label: 'Sent mail', icon: <SendIcon /> },
];

interface Args {
  modal: boolean;
  hideOnCollapse: boolean;
  defaultExpanded: boolean;
}

const meta = {
  title: 'Components/Navigation',
  args: { modal: false, hideOnCollapse: false, defaultExpanded: false },
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

function RailDemo({ modal, hideOnCollapse, defaultExpanded }: Args) {
  const [current, setCurrent] = useState('home');
  const [expanded, setExpanded] = useState(defaultExpanded);
  return (
    <div className="flex h-[520px] overflow-hidden rounded-corner-large border border-outline-variant">
      <NavigationRail
        aria-label="Main"
        data-testid="rail"
        modal={modal}
        hideOnCollapse={hideOnCollapse}
        expanded={expanded}
        onExpandedChange={setExpanded}
        header={({ expanded: open, toggle }) => (
          <>
            <IconButton
              icon={<MenuIcon />}
              aria-label={open ? 'Collapse navigation' : 'Expand navigation'}
              onPress={toggle}
            />
            <Fab icon={<EditIcon />} aria-label="Compose" elevation="flat" className="mt-[4px]" />
          </>
        )}
      >
        {DESTINATIONS.map(({ id, label, icon }) => (
          <NavigationRailItem
            key={id}
            icon={icon}
            selected={current === id}
            onPress={() => setCurrent(id)}
          >
            {label}
          </NavigationRailItem>
        ))}
      </NavigationRail>
      <main className="flex-1 p-6 text-body-large" data-testid="page">
        {modal && hideOnCollapse && (
          <IconButton
            icon={<MenuIcon />}
            aria-label="Open navigation"
            onPress={() => setExpanded(true)}
          />
        )}
        <p>Current: {current}</p>
      </main>
    </div>
  );
}

/** The rail, collapsed or expanded in place; toggle it from the menu button. */
export const Rail: Story = { render: (args) => <RailDemo {...args} /> };

/** The modal expanded rail: opens over the page with a scrim. */
export const ModalRail: Story = { args: { modal: true }, render: (args) => <RailDemo {...args} /> };

/** Collapsed and expanded rails side by side, for visual regression. */
export const RailStates: Story = {
  render: () => (
    <div className="flex w-fit gap-6" data-testid="rails">
      {[false, true].map((expanded) => (
        <div key={String(expanded)} className="h-[400px] border border-outline-variant">
          <NavigationRail
            aria-label={expanded ? 'Expanded' : 'Collapsed'}
            expanded={expanded}
            header={<Fab icon={<EditIcon />} aria-label="Compose" elevation="flat" />}
            className="h-full"
          >
            {DESTINATIONS.map(({ id, label, icon }, i) => (
              <NavigationRailItem key={id} icon={icon} selected={i === 0} disabled={i === 3}>
                {label}
              </NavigationRailItem>
            ))}
          </NavigationRail>
        </div>
      ))}
    </div>
  ),
};

function BarDemo({ iconPosition }: { iconPosition: 'top' | 'start' }) {
  const [current, setCurrent] = useState('home');
  return (
    <NavigationBar aria-label={`Bar ${iconPosition}`} iconPosition={iconPosition}>
      {DESTINATIONS.map(({ id, label, icon }) => (
        <NavigationBarItem
          key={id}
          icon={icon}
          selected={current === id}
          onPress={() => setCurrent(id)}
        >
          {label}
        </NavigationBarItem>
      ))}
    </NavigationBar>
  );
}

/** The flexible navigation bar: stacked items (compact) and inline items (medium). */
export const Bar: Story = {
  render: () => (
    <div className="flex w-[600px] flex-col gap-6" data-testid="bars">
      <div className="w-[412px]">
        <BarDemo iconPosition="top" />
      </div>
      <BarDemo iconPosition="start" />
    </div>
  ),
};

export const LayoutOverride: StoryObj<{
  override: LayoutOverrideName;
  transformedAncestor: boolean;
}> = {
  args: { override: 'none', transformedAncestor: false },
  argTypes: { override: { control: 'select', options: LAYOUT_OVERRIDE_NAMES } },
  render: function LayoutOverrideStory({ override, transformedAncestor }) {
    const [current, setCurrent] = useState('home');
    return (
      <div className={transformedAncestor ? 'translate-x-2' : undefined} style={{ minHeight: 200 }}>
        <p className="mb-4 text-body-medium" data-testid="count">
          Current {current}
        </p>
        <NavigationBar
          aria-label="Main"
          data-testid="target"
          className={`w-[360px] ${LAYOUT_OVERRIDES[override]}`}
        >
          {DESTINATIONS.slice(0, 3).map(({ id, label, icon }) => (
            <NavigationBarItem
              key={id}
              icon={icon}
              selected={current === id}
              onPress={() => setCurrent(id)}
            >
              {label}
            </NavigationBarItem>
          ))}
        </NavigationBar>
      </div>
    );
  },
};
