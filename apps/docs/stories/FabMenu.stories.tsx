import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  FabMenu,
  FabMenuItem,
  type FabMenuAlign,
  type FabMenuColor,
  type FabMenuSize,
} from '@windmorph/react';
import { useState } from 'react';
import { AddIcon, CloseIcon, DeleteIcon, EditIcon, SearchIcon, SendIcon, StarIcon } from './icons';
import {
  LAYOUT_OVERRIDES,
  LAYOUT_OVERRIDE_NAMES,
  type LayoutOverrideName,
} from './layout-overrides';

const COLORS: FabMenuColor[] = ['primary', 'secondary', 'tertiary'];
const SIZES: FabMenuSize[] = ['default', 'medium', 'large'];
const ALIGNS: FabMenuAlign[] = ['start', 'center', 'end'];

const ACTIONS = [
  { label: 'Edit', icon: <EditIcon /> },
  { label: 'Send', icon: <SendIcon /> },
  { label: 'Star', icon: <StarIcon /> },
  { label: 'Search', icon: <SearchIcon /> },
  { label: 'Delete', icon: <DeleteIcon /> },
];

interface PlaygroundArgs {
  size: FabMenuSize;
  color: FabMenuColor;
  align: FabMenuAlign;
  items: number;
}

const meta = {
  title: 'Components/FabMenu',
  args: { size: 'default', color: 'primary', align: 'end', items: 4 },
  argTypes: {
    size: { control: 'inline-radio', options: SIZES },
    color: { control: 'inline-radio', options: COLORS },
    align: { control: 'inline-radio', options: ALIGNS },
    items: { control: { type: 'range', min: 1, max: 5 } },
  },
} satisfies Meta<PlaygroundArgs>;

export default meta;
type Story = StoryObj<PlaygroundArgs>;

function Items({ count, onAction }: { count: number; onAction?: (label: string) => void }) {
  return ACTIONS.slice(0, count).map(({ label, icon }) => (
    <FabMenuItem key={label} icon={icon} onPress={() => onAction?.(label)}>
      {label}
    </FabMenuItem>
  ));
}

/** Positioned at the bottom end of a frame, the way apps place it. */
export const Playground: Story = {
  render: function PlaygroundStory({ size, color, align, items }) {
    const [last, setLast] = useState('none');
    return (
      <div className="relative h-[480px] max-w-[400px] rounded-corner-large bg-surface-container">
        <p className="p-4 text-body-medium" data-testid="last">
          Last action: {last}
        </p>
        <FabMenu
          data-testid="menu"
          icon={<AddIcon />}
          openIcon={<CloseIcon />}
          aria-label="Create"
          size={size}
          color={color}
          align={align}
          className="absolute end-4 bottom-4"
        >
          <Items count={items} onAction={setLast} />
        </FabMenu>
      </div>
    );
  },
};

/** The three colour sets, open. */
export const Colors: Story = {
  render: () => (
    <div className="flex w-fit items-end gap-8" data-testid="colors">
      {COLORS.map((color) => (
        <FabMenu
          key={color}
          defaultOpen
          color={color}
          icon={<AddIcon />}
          openIcon={<CloseIcon />}
          aria-label={`Create ${color}`}
        >
          <Items count={3} />
        </FabMenu>
      ))}
    </div>
  ),
};

/** Each FAB size closed, and open: the button becomes the 56px close button in the FAB's box. */
export const Sizes: Story = {
  render: () => (
    <div className="flex w-fit items-end gap-8" data-testid="sizes">
      {SIZES.map((size) => (
        <FabMenu key={size} size={size} icon={<AddIcon />} aria-label={`Create ${size}`}>
          <Items count={2} />
        </FabMenu>
      ))}
      {SIZES.map((size) => (
        <FabMenu
          key={`${size}-open`}
          defaultOpen
          size={size}
          icon={<AddIcon />}
          openIcon={<CloseIcon />}
          aria-label={`Close ${size}`}
        >
          <Items count={2} />
        </FabMenu>
      ))}
    </div>
  ),
};

/** Items line up with the button on the start side, the centre or the end side. */
export const Alignment: Story = {
  render: () => (
    <div className="flex w-fit items-end gap-8" data-testid="alignment">
      {ALIGNS.map((align) => (
        <FabMenu
          key={align}
          defaultOpen
          align={align}
          icon={<AddIcon />}
          openIcon={<CloseIcon />}
          aria-label={`Create ${align}`}
        >
          <Items count={3} />
        </FabMenu>
      ))}
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
    <div className={transformedAncestor ? 'translate-x-2' : undefined} style={{ minHeight: 400 }}>
      <FabMenu
        data-testid="target"
        icon={<AddIcon />}
        openIcon={<CloseIcon />}
        aria-label="Create"
        className={LAYOUT_OVERRIDES[override]}
      >
        <Items count={2} />
      </FabMenu>
    </div>
  ),
};
