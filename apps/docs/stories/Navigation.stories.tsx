import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Badge,
  type BadgeProps,
  Fab,
  IconButton,
  NavigationBar,
  NavigationBarItem,
  NavigationRail,
  NavigationRailItem,
} from '@windmorph/react';
import { useRef, useState, type ReactElement } from 'react';
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

/** Badges for the demos: a count on Search and a dot on Starred. */
const BADGES: Record<string, { badge: ReactElement<BadgeProps>; badgeLabel: string }> = {
  search: { badge: <Badge>3</Badge>, badgeLabel: '3 new results' },
  starred: { badge: <Badge />, badgeLabel: 'Updated' },
};

interface Args {
  modal: boolean;
  hideOnCollapse: boolean;
  defaultExpanded: boolean;
  itemAlignment: 'top' | 'center';
  divider: boolean;
  indicatorMotion: 'expand' | 'slide';
}

const meta = {
  title: 'Components/Navigation',
  args: {
    modal: false,
    hideOnCollapse: false,
    defaultExpanded: false,
    itemAlignment: 'top',
    divider: false,
    indicatorMotion: 'expand',
  },
  argTypes: {
    itemAlignment: { control: 'inline-radio', options: ['top', 'center'] },
    indicatorMotion: { control: 'inline-radio', options: ['expand', 'slide'] },
  },
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

function RailDemo({
  modal,
  hideOnCollapse,
  defaultExpanded,
  itemAlignment,
  divider,
  indicatorMotion,
}: Args) {
  const [current, setCurrent] = useState('home');
  const [expanded, setExpanded] = useState(defaultExpanded);
  return (
    <div className="flex h-[520px] overflow-hidden rounded-corner-large border border-outline-variant">
      <NavigationRail
        aria-label="Main"
        data-testid="rail"
        modal={modal}
        hideOnCollapse={hideOnCollapse}
        itemAlignment={itemAlignment}
        divider={divider}
        indicatorMotion={indicatorMotion}
        expanded={expanded}
        onExpandedChange={setExpanded}
        header={({ expanded: open, toggle }) => (
          <>
            <IconButton
              variant="standard"
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
            {...BADGES[id]}
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
            variant="standard"
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

/**
 * `indicatorMotion="slide"`: in the expanded rail the pill slides from the previous item to
 * the chosen one, as in Google's Expressive showcase (an extension beyond the M3 spec, which
 * expands it from the centre of the icon). Collapsed, it still expands in place.
 */
export const SlidingRail: Story = {
  args: { defaultExpanded: true, indicatorMotion: 'slide' },
  render: (args) => <RailDemo {...args} />,
};

/** Items centred as a group (M3's tablet layout), with a divider on the content edge. */
export const CenteredRail: Story = {
  args: { itemAlignment: 'center', divider: true },
  render: (args) => <RailDemo {...args} />,
};

/**
 * Collapsed and expanded rails side by side, for visual regression: badges on the icon
 * collapsed and after the label expanded, a divider, and a label that wraps.
 */
export const RailStates: Story = {
  render: () => (
    <div className="flex w-fit gap-6" data-testid="rails">
      {[false, true].map((expanded) => (
        <div key={String(expanded)} className="h-[400px] border border-outline-variant">
          <NavigationRail
            aria-label={expanded ? 'Expanded' : 'Collapsed'}
            expanded={expanded}
            divider
            header={<Fab icon={<EditIcon />} aria-label="Compose" elevation="flat" />}
            className="h-full"
          >
            {DESTINATIONS.map(({ id, label, icon }, i) => (
              <NavigationRailItem
                key={id}
                icon={icon}
                {...BADGES[id]}
                selected={i === 0}
                disabled={i === 3}
              >
                {label}
              </NavigationRailItem>
            ))}
            <NavigationRailItem icon={<StarIcon />}>Shared with me</NavigationRailItem>
          </NavigationRail>
        </div>
      ))}
    </div>
  ),
};

function BarDemo({
  iconPosition,
  destinations = DESTINATIONS,
}: {
  iconPosition: 'top' | 'start';
  destinations?: typeof DESTINATIONS;
}) {
  const [current, setCurrent] = useState('home');
  return (
    <NavigationBar aria-label={`Bar ${iconPosition}`} iconPosition={iconPosition}>
      {destinations.map(({ id, label, icon }) => (
        <NavigationBarItem
          key={id}
          icon={icon}
          {...BADGES[id]}
          selected={current === id}
          onPress={() => setCurrent(id)}
        >
          {label}
        </NavigationBarItem>
      ))}
    </NavigationBar>
  );
}

const LONG_LABELS = DESTINATIONS.map((destination) =>
  destination.id === 'sent' ? { ...destination, label: 'Recently shared files' } : destination,
);

/**
 * The flexible navigation bar: stacked items (compact), inline items centred with the extra
 * space at the ends (medium), and a narrow bar whose long label wraps and grows the bar.
 */
export const Bar: Story = {
  render: () => (
    <div className="flex w-[600px] flex-col gap-6" data-testid="bars">
      <div className="w-[412px]">
        <BarDemo iconPosition="top" />
      </div>
      <BarDemo iconPosition="start" />
      <div className="w-[320px]">
        <BarDemo iconPosition="top" destinations={LONG_LABELS} />
      </div>
    </div>
  ),
};

/** `scrollBehavior="hide-on-scroll"`: the bar hides while scrolling down, returns on up. */
export const HideOnScroll: Story = {
  render: function HideOnScrollStory() {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [current, setCurrent] = useState('home');
    return (
      <div
        ref={scrollRef}
        data-testid="scroller"
        className="h-[400px] w-[412px] overflow-y-auto border border-outline-variant"
      >
        <div className="flex flex-col gap-4 p-4 text-body-large">
          {Array.from({ length: 30 }, (_, i) => (
            <p key={i}>Paragraph {i + 1}</p>
          ))}
        </div>
        <NavigationBar
          aria-label="Main"
          data-testid="bar"
          scrollBehavior="hide-on-scroll"
          scrollRef={scrollRef}
        >
          {DESTINATIONS.map(({ id, label, icon }) => (
            <NavigationBarItem
              key={id}
              icon={icon}
              selected={current === id}
              onPress={() => setCurrent(id)}
              onReselect={() => scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              {label}
            </NavigationBarItem>
          ))}
        </NavigationBar>
      </div>
    );
  },
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

/** Layout safety (architecture §10) for the navigation rail (collapsed, 96px wide). */
export const RailLayoutOverride: StoryObj<{
  override: LayoutOverrideName;
  transformedAncestor: boolean;
}> = {
  args: { override: 'none', transformedAncestor: false },
  argTypes: { override: { control: 'select', options: LAYOUT_OVERRIDE_NAMES } },
  render: function RailLayoutOverrideStory({ override, transformedAncestor }) {
    const [current, setCurrent] = useState('home');
    return (
      <div className={transformedAncestor ? 'translate-x-2' : undefined} style={{ minHeight: 440 }}>
        <p className="mb-4 text-body-medium" data-testid="count">
          Current {current}
        </p>
        <NavigationRail
          aria-label="Main"
          data-testid="target"
          style={{ height: 360 }}
          className={LAYOUT_OVERRIDES[override]}
        >
          {DESTINATIONS.slice(0, 3).map(({ id, label, icon }) => (
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
      </div>
    );
  },
};
