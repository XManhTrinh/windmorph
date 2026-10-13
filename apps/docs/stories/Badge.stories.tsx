import type { Meta, StoryObj } from '@storybook/react-vite';
import { Badge, BadgedBox, IconButton, NavigationBar, NavigationBarItem } from '@windmorph/react';
import { HomeIcon, SearchIcon, SendIcon, StarIcon } from './icons';
import {
  LAYOUT_OVERRIDES,
  LAYOUT_OVERRIDE_NAMES,
  type LayoutOverrideName,
} from './layout-overrides';

const meta = {
  title: 'Components/Badge',
  component: Badge,
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Small and large badges, alone and on icons. */
export const Badges: Story = {
  render: () => (
    <div className="flex flex-col gap-8" data-testid="badges">
      <div className="flex items-center gap-6">
        <Badge />
        <Badge>{3}</Badge>
        <Badge>{1200}</Badge>
        <Badge max={99}>{120}</Badge>
        <Badge>New</Badge>
        <Badge>Longer</Badge>
      </div>
      <div className="flex items-center gap-10 text-on-surface-variant">
        <BadgedBox badge={<Badge />} data-testid="small">
          <span className="size-6" data-testid="small-icon">
            <StarIcon />
          </span>
        </BadgedBox>
        <BadgedBox badge={<Badge>{3}</Badge>} data-testid="large">
          <span className="size-6" data-testid="large-icon">
            <SendIcon />
          </span>
        </BadgedBox>
        <BadgedBox badge={<Badge>{1200}</Badge>}>
          <span className="size-6">
            <HomeIcon />
          </span>
        </BadgedBox>
      </div>
      <NavigationBar aria-label="Main" className="w-[412px]">
        <NavigationBarItem
          selected
          icon={
            <BadgedBox badge={<Badge>{3}</Badge>}>
              <span className="size-6">
                <HomeIcon />
              </span>
            </BadgedBox>
          }
        >
          Home
        </NavigationBarItem>
        <NavigationBarItem
          icon={
            <BadgedBox badge={<Badge />}>
              <span className="size-6">
                <SearchIcon />
              </span>
            </BadgedBox>
          }
        >
          Search
        </NavigationBarItem>
        <NavigationBarItem icon={<StarIcon />}>Starred</NavigationBarItem>
      </NavigationBar>
      <IconButton
        variant="standard"
        aria-label="Messages, 12 unread"
        icon={
          <BadgedBox badge={<Badge>{12}</Badge>}>
            <SendIcon />
          </BadgedBox>
        }
      />
    </div>
  ),
};

/** Layout safety (architecture §10). */
export const LayoutOverride: StoryObj<{
  override: LayoutOverrideName;
  transformedAncestor: boolean;
}> = {
  args: { override: 'none', transformedAncestor: false },
  argTypes: { override: { control: 'select', options: LAYOUT_OVERRIDE_NAMES } },
  render: ({ override, transformedAncestor }) => (
    <div
      className={transformedAncestor ? 'translate-x-2' : undefined}
      style={{ minHeight: 200, padding: 16 }}
    >
      <BadgedBox
        data-testid="target"
        className={LAYOUT_OVERRIDES[override]}
        badge={<Badge>3</Badge>}
      >
        <span className="size-6">
          <StarIcon />
        </span>
      </BadgedBox>
    </div>
  ),
};
