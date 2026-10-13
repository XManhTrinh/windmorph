import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  ChipSet,
  FilterChip,
  IconButton,
  TopAppBar,
  type TopAppBarScrolledColor,
  type TopAppBarScrollBehavior,
  type TopAppBarTitleAlign,
  type TopAppBarVariant,
} from '@windmorph/react';
import { useRef, useState } from 'react';
import { ArrowBackIcon, MoreVertIcon, SearchIcon, StarIcon } from './icons';
import {
  LAYOUT_OVERRIDES,
  LAYOUT_OVERRIDE_NAMES,
  type LayoutOverrideName,
} from './layout-overrides';

interface Args {
  variant: TopAppBarVariant;
  titleAlign: TopAppBarTitleAlign;
  subtitle: boolean;
  scrollBehavior: TopAppBarScrollBehavior;
  /** Show a row of filter chips in the `bottom` slot. */
  bottom: boolean;
  scrolledColor: TopAppBarScrolledColor;
}

const meta = {
  title: 'Components/TopAppBar',
  args: {
    variant: 'medium',
    titleAlign: 'start',
    subtitle: false,
    scrollBehavior: 'exit-until-collapsed',
    bottom: false,
    scrolledColor: 'container',
  },
  argTypes: {
    variant: { control: 'inline-radio', options: ['small', 'medium', 'large'] },
    titleAlign: { control: 'inline-radio', options: ['start', 'center'] },
    scrollBehavior: {
      control: 'inline-radio',
      options: ['pinned', 'enter-always', 'exit-until-collapsed'],
    },
    scrolledColor: { control: 'inline-radio', options: ['container', 'transparent'] },
  },
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

const back = <IconButton icon={<ArrowBackIcon />} aria-label="Back" />;
const actions = (
  <>
    <IconButton icon={<StarIcon />} aria-label="Favourite" />
    <IconButton icon={<MoreVertIcon />} aria-label="More" />
  </>
);

/** Every size, with and without a subtitle, start-aligned and centred. */
export const Variants: Story = {
  render: () => (
    <div className="flex w-[412px] flex-col gap-4" data-testid="bars">
      <TopAppBar title="Small" navigationIcon={back} actions={actions} />
      <TopAppBar title="Small" subtitle="Subtitle" navigationIcon={back} actions={actions} />
      <TopAppBar title="Centred" titleAlign="center" navigationIcon={back} actions={actions} />
      <TopAppBar
        title="No navigation"
        actions={<IconButton icon={<SearchIcon />} aria-label="Search" />}
      />
      <TopAppBar variant="medium" title="Medium" navigationIcon={back} actions={actions} />
      <TopAppBar
        variant="medium"
        title="Medium"
        subtitle="Subtitle"
        navigationIcon={back}
        actions={actions}
      />
      <TopAppBar variant="large" title="Large" navigationIcon={back} actions={actions} />
      <TopAppBar
        variant="large"
        title="Large"
        subtitle="Subtitle"
        titleAlign="center"
        navigationIcon={back}
        actions={actions}
      />
    </div>
  ),
};

/** A long headline wraps to two lines at most (M3). */
export const LongTitle: Story = {
  render: () => (
    <div className="w-[412px]">
      <TopAppBar
        data-testid="bar"
        variant="large"
        title="Quarterly planning notes for the design systems team"
        navigationIcon={back}
        actions={actions}
      />
    </div>
  ),
};

const chips = (
  <ChipSet
    aria-label="Filter"
    selectionMode="single"
    defaultSelectedKeys={['all']}
    layout="scroll"
    className="px-[8px] pb-[8px]"
    data-testid="chips"
  >
    <FilterChip value="all">All</FilterChip>
    <FilterChip value="unread">Unread</FilterChip>
    <FilterChip value="starred">Starred</FilterChip>
    <FilterChip value="files">With files</FilterChip>
  </ChipSet>
);

/**
 * A bar above scrolling content: pinned, enter-always or exit-until-collapsed, optionally
 * with a row of chips in its `bottom` slot and a see-through scrolled colour (with filled
 * icon buttons).
 */
export const Scrolling: Story = {
  render: function ScrollingStory({
    variant,
    titleAlign,
    subtitle,
    scrollBehavior,
    bottom,
    scrolledColor,
  }) {
    const scrollRef = useRef<HTMLDivElement>(null);
    return (
      <div
        ref={scrollRef}
        data-testid="scroller"
        className="h-[480px] w-[412px] overflow-y-auto rounded-corner-large border border-outline-variant"
      >
        <TopAppBar
          data-testid="bar"
          variant={variant}
          titleAlign={titleAlign}
          title="Inbox"
          subtitle={subtitle ? '24 messages' : undefined}
          navigationIcon={
            scrolledColor === 'transparent' ? (
              <IconButton variant="tonal" icon={<ArrowBackIcon />} aria-label="Back" />
            ) : (
              back
            )
          }
          actions={
            scrolledColor === 'transparent' ? (
              <IconButton variant="tonal" icon={<MoreVertIcon />} aria-label="More" />
            ) : (
              actions
            )
          }
          scrollBehavior={scrollBehavior}
          scrollRef={scrollRef}
          bottom={bottom ? chips : undefined}
          scrolledColor={scrolledColor}
        />
        {Array.from({ length: 40 }, (_, index) => (
          <p key={index} className="px-4 py-3 text-body-large">
            Message {index + 1}
          </p>
        ))}
      </div>
    );
  },
};

/** Layout safety (architecture §10). */
export const LayoutOverride: StoryObj<{
  override: LayoutOverrideName;
  transformedAncestor: boolean;
}> = {
  args: { override: 'none', transformedAncestor: false },
  argTypes: { override: { control: 'select', options: LAYOUT_OVERRIDE_NAMES } },
  render: function LayoutOverrideStory({ override, transformedAncestor }) {
    const [count, setCount] = useState(0);
    return (
      <div
        className={transformedAncestor ? 'translate-x-2' : undefined}
        style={{ minHeight: 200, width: 412 }}
      >
        <p className="mb-4 text-body-medium" data-testid="count">
          Pressed {count}
        </p>
        <TopAppBar
          data-testid="target"
          className={LAYOUT_OVERRIDES[override]}
          title="Inbox"
          navigationIcon={
            <IconButton
              icon={<ArrowBackIcon />}
              aria-label="Back"
              onPress={() => setCount((c) => c + 1)}
            />
          }
          actions={actions}
        />
      </div>
    );
  },
};
