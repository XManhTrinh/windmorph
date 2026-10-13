import type { Meta, StoryObj } from '@storybook/react-vite';
import { Badge, Tab, Tabs, type TabsVariant } from '@windmorph/react';
import { EditIcon, SearchIcon, SendIcon, StarIcon } from './icons';
import {
  LAYOUT_OVERRIDES,
  LAYOUT_OVERRIDE_NAMES,
  type LayoutOverrideName,
} from './layout-overrides';

const VARIANTS: TabsVariant[] = ['primary', 'secondary'];

interface Args {
  variant: TabsVariant;
  scrollable: boolean;
  iconPlacement: 'top' | 'start';
  align: 'stretch' | 'start' | 'center';
  swipeable: boolean;
}

const meta = {
  title: 'Components/Tabs',
  args: {
    variant: 'primary',
    scrollable: false,
    iconPlacement: 'top',
    align: 'stretch',
    swipeable: false,
  },
  argTypes: {
    variant: { control: 'inline-radio', options: VARIANTS },
    iconPlacement: { control: 'inline-radio', options: ['top', 'start'] },
    align: { control: 'inline-radio', options: ['stretch', 'start', 'center'] },
  },
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

const panel = (text: string) => <p className="p-4 text-body-medium">{text}</p>;

export const Playground: Story = {
  render: (args) => (
    <div className="max-w-[480px]">
      <Tabs aria-label="Inbox" {...args}>
        <Tab key="all" title="All" icon={<StarIcon />}>
          {panel('Everything in one place.')}
        </Tab>
        <Tab key="sent" title="Sent" icon={<SendIcon />}>
          {panel('Messages you sent.')}
        </Tab>
        <Tab key="drafts" title="Drafts" icon={<EditIcon />}>
          {panel('Unfinished messages.')}
        </Tab>
      </Tabs>
    </div>
  ),
};

/** Primary and secondary rows: text, icons above and icons before the label. */
export const Variants: Story = {
  render: () => (
    <div className="flex w-[480px] flex-col gap-8" data-testid="variants">
      {VARIANTS.map((variant) => (
        <div key={variant} className="flex flex-col gap-4">
          <Tabs aria-label={`${variant} text`} variant={variant} defaultSelectedKey="b">
            <Tab key="a" title="Video" />
            <Tab key="b" title="Photos" />
            <Tab key="c" title="Audio" />
          </Tabs>
          <Tabs aria-label={`${variant} icons`} variant={variant}>
            <Tab key="a" title="Starred" icon={<StarIcon />} />
            <Tab key="b" title="Search" icon={<SearchIcon />} />
            <Tab key="c" title="Edit" icon={<EditIcon />} />
          </Tabs>
          <Tabs
            aria-label={`${variant} inline icons`}
            variant={variant}
            iconPlacement="start"
            disabledKeys={['c']}
          >
            <Tab key="a" title="Starred" icon={<StarIcon />} />
            <Tab key="b" title="Search" icon={<SearchIcon />} />
            <Tab key="c" title="Edit" icon={<EditIcon />} />
          </Tabs>
        </div>
      ))}
    </div>
  ),
};

/** Badges on stacked icons and after labels, and a centred group of equal-width tabs. */
export const Badges: Story = {
  render: () => (
    <div className="flex w-[560px] flex-col gap-8" data-testid="badges">
      <Tabs aria-label="Mailbox" align="center">
        <Tab key="all" title="All" icon={<StarIcon />} badge={<Badge>12</Badge>} />
        <Tab key="sent" title="Sent" icon={<SendIcon />} />
        <Tab key="drafts" title="Drafts" icon={<EditIcon />} badge={<Badge />} />
      </Tabs>
      <Tabs aria-label="Updates" variant="secondary" align="start">
        <Tab key="new" title="New" badge={<Badge>{1000}</Badge>} />
        <Tab key="older" title="Older updates" />
      </Tabs>
      <Tabs aria-label="Folders" iconPlacement="start">
        <Tab key="starred" title="Starred" icon={<StarIcon />} badge={<Badge>3</Badge>} />
        <Tab key="search" title="Search" icon={<SearchIcon />} />
      </Tabs>
    </div>
  ),
};

const MANY = [
  'Overview',
  'Specifications',
  'Reviews',
  'Questions',
  'Accessories',
  'Shipping',
  'Returns',
];

/** A scrollable row: tabs keep their width and the selection scrolls to the centre. */
export const Scrollable: Story = {
  render: () => (
    <div className="w-[360px]" data-testid="scrollable">
      <Tabs aria-label="Product" scrollable>
        {MANY.map((title) => (
          <Tab key={title} title={title}>
            {panel(`${title} panel`)}
          </Tab>
        ))}
      </Tabs>
    </div>
  ),
};

export const LayoutOverride: StoryObj<{
  override: LayoutOverrideName;
  transformedAncestor: boolean;
}> = {
  args: { override: 'none', transformedAncestor: false },
  argTypes: { override: { control: 'select', options: LAYOUT_OVERRIDE_NAMES } },
  render: ({ override, transformedAncestor }) => (
    <div className={transformedAncestor ? 'translate-x-2' : undefined} style={{ minHeight: 300 }}>
      <Tabs
        aria-label="Sections"
        data-testid="target"
        className={`w-[320px] ${LAYOUT_OVERRIDES[override]}`}
      >
        <Tab key="a" title="One" />
        <Tab key="b" title="Two" />
      </Tabs>
    </div>
  ),
};
