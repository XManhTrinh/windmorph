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
          // A scrolling area with nothing focusable in it takes focus, so keys can scroll it.
          role="region"
          aria-label="Inbox messages"
          tabIndex={0}
          refreshing={refreshing}
          onRefresh={() => {
            setCount((value) => value + 1);
            setRefreshing(true);
          }}
          threshold={threshold}
          disabled={disabled}
          className="min-h-0 grow overflow-y-auto -outline-offset-2 focus-visible:outline-2 focus-visible:outline-secondary"
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
      role="region"
      aria-label="Messages"
      tabIndex={0}
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

/**
 * Consumer layouts, each with a gap: on the root, or (`gridInner`) on an element inside it,
 * the pattern the docs recommend for a grid.
 */
const CONTENT_LAYOUTS = {
  block: { root: 'block space-y-4' },
  flexColumn: { root: 'flex flex-col gap-4' },
  flexColumnReverse: { root: 'flex flex-col-reverse gap-4' },
  flexRow: { root: 'flex gap-4' },
  grid: { root: 'grid gap-4' },
  // `content-start`: two rows don't fill the 240px area, and stretched rows would share the
  // free space with the layer's row too.
  gridColumns: { root: 'grid grid-cols-2 content-start gap-4' },
  gridInner: { root: '', inner: 'grid gap-4' },
} as const satisfies Record<string, { root: string; inner?: string }>;

/**
 * A `gap-*` on a flex root, or `space-y-*` on a block root, spaces the content only: the
 * indicator's layer, the root's first child, adds no gap above the first item. On a grid root
 * the layer is a grid item, so one row gap opens above the content (documented); with the grid
 * on an element inside the root (`gridInner`) the content starts at the top.
 */
export const ContentLayout: StoryObj<{ layout: keyof typeof CONTENT_LAYOUTS }> = {
  args: { layout: 'flexColumn' },
  argTypes: { layout: { control: 'select', options: Object.keys(CONTENT_LAYOUTS) } },
  render: function ContentLayoutStory({ layout }) {
    const config: { root: string; inner?: string } = CONTENT_LAYOUTS[layout];
    const items = ['Alex', 'Sam', 'Priya', 'Zoë'].map((name) => (
      <p key={name} data-testid="item" className="h-12 bg-surface text-body-medium text-on-surface">
        {name}
      </p>
    ));
    return (
      <PullToRefresh
        data-testid="target"
        onRefresh={() => undefined}
        className={`h-[240px] w-[320px] overflow-y-auto bg-surface-container ${config.root}`}
      >
        {config.inner ? <div className={config.inner}>{items}</div> : items}
      </PullToRefresh>
    );
  },
};
