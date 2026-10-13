import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Button,
  IconButton,
  Menu,
  MenuGroup,
  MenuItem,
  MenuTrigger,
  type MenuVariant,
} from '@windmorph/react';
import { useState } from 'react';
import { AddIcon, DeleteIcon, EditIcon, SearchIcon, StarIcon } from './icons';

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
type Story = StoryObj<{ variant: MenuVariant }>;

/** Grouped items with icons, a description and shortcuts. */
export const Grouped: Story = {
  args: { variant: 'standard' },
  argTypes: { variant: { control: 'inline-radio', options: ['standard', 'vibrant'] } },
  render: function GroupedStory({ variant }) {
    const [last, setLast] = useState('none');
    return (
      <div className="flex flex-col items-start gap-4">
        <MenuTrigger>
          <IconButton variant="standard" icon={<MoreIcon />} aria-label="More" />
          <Menu variant={variant} onAction={(key) => setLast(String(key))} disabledKeys={['star']}>
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
  args: { variant: 'standard' },
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
