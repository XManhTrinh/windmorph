import type { Meta, StoryObj } from '@storybook/react-vite';
import { IconButton, List, ListItem, PullToRefresh } from '@windmorph/react';
import { useState } from 'react';
import {
  LAYOUT_OVERRIDES,
  LAYOUT_OVERRIDE_NAMES,
  type LayoutOverrideName,
} from './layout-overrides';

/** Material Symbols (Apache-2.0) "refresh". */
function RefreshIcon() {
  return (
    <svg viewBox="0 -960 960 960" fill="currentColor">
      <path d="M480-160q-134 0-227-93t-93-227q0-134 93-227t227-93q69 0 132 28.5T720-690v-110h80v280H520v-80h168q-32-56-87.5-88T480-720q-100 0-170 70t-70 170q0 100 70 170t170 70q77 0 139-44t87-116h84q-28 106-114 173t-196 67Z" />
    </svg>
  );
}

const PEOPLE = ['Alex', 'Sam', 'Priya', 'Zoë', 'Jonas', 'Mei', 'Omar', 'Lena'];
const MESSAGES = [
  'Lunch at noon?',
  'Running ten minutes late',
  'The slides are ready',
  'Crème brûlée for dessert',
  'Call me when you land',
];

interface FeedArgs {
  threshold: number;
  disabled: boolean;
}

const meta = {
  title: 'Components/PullToRefresh',
  args: { threshold: 80, disabled: false },
  argTypes: { threshold: { control: { type: 'number', min: 40, max: 200 } } },
} satisfies Meta<FeedArgs>;

export default meta;
type Story = StoryObj<FeedArgs>;

/**
 * A scrolling feed. Pull down at the top (touch, or drag with a mouse) past the threshold to
 * refresh; "Finish refresh" ends it, as a network response would. The refresh button is the
 * spec's non-gesture alternative.
 */
export const Feed: Story = {
  render: function Render({ threshold, disabled }) {
    const [refreshing, setRefreshing] = useState(false);
    const [count, setCount] = useState(0);
    const items = 30;
    return (
      <div className="flex h-[640px] w-[360px] flex-col bg-surface">
        <div className="flex h-16 shrink-0 items-center gap-2 ps-4 pe-1">
          <h1 className="grow text-title-large text-on-surface">Inbox</h1>
          <span data-testid="count" className="text-label-medium text-on-surface-variant">
            {count}
          </span>
          <IconButton
            variant="standard"
            icon={<RefreshIcon />}
            aria-label="Refresh"
            onPress={() => {
              setCount((value) => value + 1);
              setRefreshing(true);
            }}
          />
        </div>
        <PullToRefresh
          data-testid="area"
          refreshing={refreshing}
          onRefresh={() => {
            setCount((value) => value + 1);
            setRefreshing(true);
          }}
          threshold={threshold}
          disabled={disabled}
          className="min-h-0 grow overflow-y-auto"
        >
          <List aria-label="Messages">
            {Array.from({ length: items }, (_, index) => (
              <ListItem
                key={String(index)}
                supportingText={MESSAGES[(index + count) % MESSAGES.length]}
              >
                {PEOPLE[(index + count) % PEOPLE.length]}
              </ListItem>
            ))}
          </List>
        </PullToRefresh>
        <button
          type="button"
          className="h-12 shrink-0 bg-surface-container text-label-large text-primary"
          onClick={() => setRefreshing(false)}
        >
          Finish refresh
        </button>
      </div>
    );
  },
};

/** Refreshing from the start: the indicator rests at the threshold. */
export const Refreshing: Story = {
  render: () => (
    <PullToRefresh
      refreshing
      onRefresh={() => undefined}
      data-testid="area"
      className="h-[320px] w-[360px] overflow-y-auto bg-surface"
    >
      <List aria-label="Messages">
        {PEOPLE.map((person, index) => (
          <ListItem key={person} supportingText={MESSAGES[index % MESSAGES.length]}>
            {person}
          </ListItem>
        ))}
      </List>
    </PullToRefresh>
  ),
};

/** Architecture §10: any consumer layout class on the root keeps the area working. */
export const LayoutOverride: StoryObj<{
  override: LayoutOverrideName;
  transformedAncestor: boolean;
}> = {
  args: { override: 'none', transformedAncestor: false },
  argTypes: { override: { control: 'select', options: LAYOUT_OVERRIDE_NAMES } },
  render: function Render({ override, transformedAncestor }) {
    const [count, setCount] = useState(0);
    return (
      <div className={transformedAncestor ? 'translate-x-2' : undefined} style={{ minHeight: 360 }}>
        <PullToRefresh
          data-testid="target"
          onRefresh={() => setCount((value) => value + 1)}
          className={`h-[240px] w-[200px] bg-surface-container ${LAYOUT_OVERRIDES[override]}`}
        >
          <p className="p-4 text-body-medium text-on-surface">Pull down to refresh</p>
        </PullToRefresh>
        <span data-testid="refreshes">{count}</span>
      </div>
    );
  },
};
