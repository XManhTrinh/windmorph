import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Badge,
  Button,
  Card,
  ContextMenuTrigger,
  IconButton,
  Menu,
  MenuGroup,
  MenuItem,
  MenuTrigger,
  SubmenuTrigger,
  type MenuLayout,
  type MenuPresentation,
  type MenuVariant,
} from '@windmorph/react';
import { useState } from 'react';
import { AddIcon, DeleteIcon, EditIcon, SearchIcon, SendIcon, StarIcon } from './icons';
import {
  LAYOUT_OVERRIDES,
  LAYOUT_OVERRIDE_NAMES,
  type LayoutOverrideName,
} from './layout-overrides';

const MoreIcon = () => (
  <svg viewBox="0 -960 960 960" fill="currentColor">
    <path d="M480-160q-33 0-56.5-23.5T400-240q0-33 23.5-56.5T480-320q33 0 56.5 23.5T560-240q0 33-23.5 56.5T480-160Zm0-240q-33 0-56.5-23.5T400-480q0-33 23.5-56.5T480-560q33 0 56.5 23.5T560-480q0 33-23.5 56.5T480-400Zm0-240q-33 0-56.5-23.5T400-720q0-33 23.5-56.5T480-800q33 0 56.5 23.5T560-720q0 33-23.5 56.5T480-640Z" />
  </svg>
);

const meta = {
  title: 'Components/Menu',
  component: Menu,
} satisfies Meta<typeof Menu>;

export default meta;
type Story = StoryObj<{
  variant: MenuVariant;
  layout: MenuLayout;
  presentation?: MenuPresentation;
  instant?: boolean;
}>;

/**
 * Grouped items with icons, a description and shortcuts. Groups are set apart by dividers
 * (the default, as M3 recommends on the web) or by gaps. `presentation` opens the menu in
 * a bottom sheet (`sheet`, or `auto` on compact windows); `instant` drops the motion.
 */
export const Grouped: Story = {
  args: { variant: 'standard', layout: 'divider', presentation: 'popover', instant: false },
  argTypes: {
    variant: { control: 'inline-radio', options: ['standard', 'vibrant'] },
    layout: { control: 'inline-radio', options: ['divider', 'gap'] },
    presentation: { control: 'inline-radio', options: ['popover', 'sheet', 'auto'] },
    instant: { control: 'boolean' },
  },
  render: function GroupedStory({ variant, layout, presentation, instant }) {
    const [last, setLast] = useState('none');
    return (
      <div className="flex flex-col items-start gap-4">
        <MenuTrigger>
          <IconButton variant="standard" icon={<MoreIcon />} aria-label="More" />
          <Menu
            variant={variant}
            layout={layout}
            presentation={presentation}
            instant={instant}
            onAction={(key) => setLast(String(key))}
            disabledKeys={['star']}
          >
            <MenuGroup title="Edit">
              <MenuItem key="add" leadingIcon={<AddIcon />} shortcut="⌘N">
                New
              </MenuItem>
              <MenuItem key="edit" leadingIcon={<EditIcon />} description="Rename or move">
                Edit
              </MenuItem>
              <MenuItem key="search" leadingIcon={<SearchIcon />} shortcut="⌘F">
                Find
              </MenuItem>
            </MenuGroup>
            <MenuGroup aria-label="More actions">
              <MenuItem key="star" leadingIcon={<StarIcon />}>
                Favourite
              </MenuItem>
              <MenuItem key="delete" leadingIcon={<DeleteIcon />}>
                Delete
              </MenuItem>
            </MenuGroup>
          </Menu>
        </MenuTrigger>
        <p className="text-body-medium" data-testid="last">
          Last action: {last}
        </p>
      </div>
    );
  },
};

/** Single selection: the selected item takes the selected shape and a check expands in. */
export const SingleSelection: Story = {
  args: { variant: 'standard', layout: 'divider' },
  render: function SelectionStory({ variant }) {
    const [sort, setSort] = useState(new Set(['name']));
    return (
      <MenuTrigger>
        <Button variant="tonal">Sort by {[...sort][0]}</Button>
        <Menu
          variant={variant}
          aria-label="Sort by"
          selectionMode="single"
          selectedKeys={sort}
          onSelectionChange={(keys) => setSort(new Set([...(keys as Set<string>)]))}
        >
          <MenuItem key="name">Name</MenuItem>
          <MenuItem key="date">Date modified</MenuItem>
          <MenuItem key="size">Size</MenuItem>
        </Menu>
      </MenuTrigger>
    );
  },
};

/**
 * Submenus open beside their item on hover, press or the arrow key. While one is open, the
 * item that opened it keeps a pressed layer and the menu holding focus has rounder corners.
 */
export const Submenus: Story = {
  args: { variant: 'standard', layout: 'divider' },
  render: function SubmenuStory({ variant, layout }) {
    const [last, setLast] = useState('none');
    const run = (key: unknown) => setLast(String(key));
    return (
      <div className="flex flex-col items-start gap-4">
        <MenuTrigger>
          <Button variant="tonal">File</Button>
          <Menu variant={variant} layout={layout} onAction={run}>
            <MenuItem key="new" leadingIcon={<AddIcon />}>
              New
            </MenuItem>
            <SubmenuTrigger>
              <MenuItem key="share" leadingIcon={<SendIcon />}>
                Share
              </MenuItem>
              <Menu aria-label="Share" onAction={run}>
                <MenuItem key="email">Email</MenuItem>
                <MenuItem key="link">Copy link</MenuItem>
                <SubmenuTrigger>
                  <MenuItem key="export">Export as</MenuItem>
                  <Menu aria-label="Export as" onAction={run}>
                    <MenuItem key="pdf">PDF</MenuItem>
                    <MenuItem key="csv">CSV</MenuItem>
                  </Menu>
                </SubmenuTrigger>
              </Menu>
            </SubmenuTrigger>
            <MenuItem key="inbox" badge={<Badge>3</Badge>}>
              Inbox
            </MenuItem>
          </Menu>
        </MenuTrigger>
        <p className="text-body-medium" data-testid="last">
          Last action: {last}
        </p>
      </div>
    );
  },
};

/** A secondary click (or Shift + F10, or a long press) opens a context menu at the pointer. */
export const ContextMenu: Story = {
  args: { variant: 'standard', layout: 'divider' },
  render: function ContextMenuStory({ variant, layout }) {
    const [last, setLast] = useState('none');
    return (
      <div className="flex flex-col items-start gap-4">
        <ContextMenuTrigger>
          <Card variant="outlined" className="w-[320px] p-[16px]" data-testid="target">
            <p className="text-body-large">Right-click this card</p>
          </Card>
          <Menu
            aria-label="Card actions"
            variant={variant}
            layout={layout}
            onAction={(key) => setLast(String(key))}
          >
            <MenuItem key="edit" leadingIcon={<EditIcon />}>
              Edit
            </MenuItem>
            <MenuItem key="star" leadingIcon={<StarIcon />}>
              Favourite
            </MenuItem>
            <MenuItem key="delete" leadingIcon={<DeleteIcon />}>
              Delete
            </MenuItem>
          </Menu>
        </ContextMenuTrigger>
        <p className="text-body-medium" data-testid="last">
          Last action: {last}
        </p>
      </div>
    );
  },
};

/** A long menu scrolls; a `gap` menu that has to scroll switches to dividers (M3). */
export const Scrolling: Story = {
  args: { variant: 'standard', layout: 'gap' },
  render: ({ variant, layout }) => (
    <MenuTrigger>
      <Button variant="outlined">Country</Button>
      <Menu aria-label="Country" variant={variant} layout={layout}>
        {Array.from({ length: 4 }, (_, group) => (
          <MenuGroup key={group} aria-label={`Region ${group + 1}`}>
            {Array.from({ length: 8 }, (_, item) => (
              <MenuItem key={`${group}-${item}`}>{`Option ${group * 8 + item + 1}`}</MenuItem>
            ))}
          </MenuGroup>
        ))}
      </Menu>
    </MenuTrigger>
  ),
};

/**
 * Layout safety (architecture §10): a consumer layout class on the trigger (`part:
 * trigger`) or on the menu (`className`, `part: panel`), inside an optional transformed
 * ancestor. The trigger keeps its size, corners, state layer and focus ring; the menu still
 * opens against it in the window, keeps its corners, and takes and returns focus.
 */
export const LayoutOverride: StoryObj<{
  override: LayoutOverrideName;
  transformedAncestor: boolean;
  part: 'trigger' | 'panel';
}> = {
  args: { override: 'none', transformedAncestor: false, part: 'trigger' },
  argTypes: {
    override: { control: 'select', options: LAYOUT_OVERRIDE_NAMES },
    part: { control: 'inline-radio', options: ['trigger', 'panel'] },
  },
  render: function LayoutOverrideStory({ override, transformedAncestor, part }) {
    const [last, setLast] = useState('none');
    const layout = LAYOUT_OVERRIDES[override];
    return (
      <div className={transformedAncestor ? 'translate-x-2' : undefined} style={{ minHeight: 200 }}>
        <p className="mb-4 text-body-medium" data-testid="count">
          Last action: {last}
        </p>
        <MenuTrigger>
          <IconButton
            data-testid="target"
            variant="standard"
            icon={<MoreIcon />}
            aria-label="More"
            className={part === 'trigger' ? layout : undefined}
          />
          <Menu
            aria-label="More"
            className={part === 'panel' ? layout : undefined}
            onAction={(key) => setLast(String(key))}
          >
            <MenuItem key="edit" leadingIcon={<EditIcon />}>
              Edit
            </MenuItem>
            <MenuItem key="delete" leadingIcon={<DeleteIcon />}>
              Delete
            </MenuItem>
          </Menu>
        </MenuTrigger>
      </div>
    );
  },
};
