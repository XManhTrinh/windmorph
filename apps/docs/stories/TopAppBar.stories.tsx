import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  IconButton,
  TopAppBar,
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
}

const meta = {
  title: 'Components/TopAppBar',
  args: {
    variant: 'medium',
    titleAlign: 'start',
    subtitle: false,
    scrollBehavior: 'exit-until-collapsed',
  },
  argTypes: {
    variant: { control: 'inline-radio', options: ['small', 'medium', 'large'] },
    titleAlign: { control: 'inline-radio', options: ['start', 'center'] },
    scrollBehavior: {
      control: 'inline-radio',
      options: ['pinned', 'enter-always', 'exit-until-collapsed'],
    },
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

/** A bar above scrolling content: pinned, enter-always or exit-until-collapsed. */
export const Scrolling: Story = {
  render: function ScrollingStory({ variant, titleAlign, subtitle, scrollBehavior }) {
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
          navigationIcon={back}
          actions={actions}
          scrollBehavior={scrollBehavior}
          scrollRef={scrollRef}
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
