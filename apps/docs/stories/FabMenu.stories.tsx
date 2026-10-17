import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  FabMenu,
  FabMenuItem,
  type FabMenuColor,
  type FabMenuPresentation,
  type FabMenuSize,
  type IconTransition,
} from '@windmorph/react';
import { useState } from 'react';
import {
  AddIcon,
  CloseIcon,
  DeleteIcon,
  EditIcon,
  SearchIcon,
  SendIcon,
  HomeIcon,
  StarIcon,
} from './icons';
import {
  LAYOUT_OVERRIDES,
  LAYOUT_OVERRIDE_NAMES,
  type LayoutOverrideName,
} from './layout-overrides';
import { TallPage } from './scroll-anchoring';

const COLORS: FabMenuColor[] = ['primary', 'secondary', 'tertiary'];
const SIZES: FabMenuSize[] = ['default', 'md', 'lg'];
const PRESENTATIONS: FabMenuPresentation[] = ['list', 'menu'];

const ACTIONS = [
  { label: 'Edit', icon: <EditIcon /> },
  { label: 'Send', icon: <SendIcon /> },
  { label: 'Star', icon: <StarIcon /> },
  { label: 'Search', icon: <SearchIcon /> },
  { label: 'Delete', icon: <DeleteIcon /> },
  { label: 'Home', icon: <HomeIcon /> },
];

interface PlaygroundArgs {
  size: FabMenuSize;
  color: FabMenuColor;
  presentation: FabMenuPresentation;
  items: number;
}

const meta = {
  title: 'Components/FabMenu',
  args: { size: 'default', color: 'primary', presentation: 'list', items: 4 },
  argTypes: {
    size: { control: 'inline-radio', options: SIZES },
    color: { control: 'inline-radio', options: COLORS },
    presentation: { control: 'inline-radio', options: PRESENTATIONS },
    items: { control: { type: 'range', min: 2, max: 6 } },
  },
} satisfies Meta<PlaygroundArgs>;

export default meta;
type Story = StoryObj<PlaygroundArgs>;

/** The first `count` actions, as the menu's direct `FabMenuItem` children. */
function actions(count: number, onAction?: (label: string) => void) {
  return ACTIONS.slice(0, count).map(({ label, icon }) => (
    <FabMenuItem key={label} icon={icon} onAction={() => onAction?.(label)}>
      {label}
    </FabMenuItem>
  ));
}

/** Positioned at the bottom end of a frame, the way apps place it. */
export const Playground: Story = {
  render: function PlaygroundStory({ size, color, presentation, items }) {
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
          presentation={presentation}
          className="absolute end-4 bottom-4"
        >
          {actions(items, setLast)}
        </FabMenu>
      </div>
    );
  },
};

/**
 * How the add icon becomes the close icon: `swap` halfway through the morph (the M3 spec
 * and Compose), or `rotate`, a rotating crossfade beyond the M3 spec, as in Google's
 * Expressive showcase.
 */
export const IconTransitions: StoryObj<{ iconTransition: IconTransition }> = {
  args: { iconTransition: 'rotate' },
  argTypes: { iconTransition: { control: 'inline-radio', options: ['swap', 'rotate'] } },
  render: ({ iconTransition }) => (
    <div className="relative h-[400px] max-w-[400px] rounded-corner-large bg-surface-container">
      <FabMenu
        data-testid="menu"
        icon={<AddIcon />}
        openIcon={<CloseIcon />}
        iconTransition={iconTransition}
        aria-label="Create"
        className="absolute end-4 bottom-4"
      >
        {actions(3)}
      </FabMenu>
    </div>
  ),
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
          {actions(3)}
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
          {actions(2)}
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
          {actions(2)}
        </FabMenu>
      ))}
    </div>
  ),
};

/** The menu sits on the trailing edge, which is the left edge in right-to-left layouts. */
export const TrailingEdge: Story = {
  render: () => (
    <div
      className="flex h-[320px] w-[320px] items-end justify-end rounded-corner-large bg-surface-container p-4"
      data-testid="trailing-edge"
    >
      <FabMenu defaultOpen icon={<AddIcon />} openIcon={<CloseIcon />} aria-label="Create">
        {actions(3)}
      </FabMenu>
    </div>
  ),
};

/** On a short window the items scroll behind the close button. */
export const ShortWindow: Story = {
  render: () => (
    <FabMenu
      data-testid="menu"
      defaultOpen
      icon={<AddIcon />}
      openIcon={<CloseIcon />}
      aria-label="Create"
      className="fixed end-4 bottom-4"
    >
      {actions(6)}
    </FabMenu>
  ),
};

/** On the web and in large windows, the FAB opens a standard menu 4px above it. */
export const MenuPresentation: Story = {
  render: function MenuStory() {
    const [last, setLast] = useState('none');
    return (
      <div className="relative h-[400px] max-w-[480px] rounded-corner-large bg-surface-container">
        <p className="p-4 text-body-medium" data-testid="last">
          Last action: {last}
        </p>
        <FabMenu
          presentation="menu"
          size="lg"
          icon={<AddIcon />}
          openIcon={<CloseIcon />}
          aria-label="Create"
          className="absolute end-6 bottom-6"
        >
          {actions(4, setLast)}
        </FabMenu>
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
  render: ({ override, transformedAncestor }) => (
    <div className={transformedAncestor ? 'translate-x-2' : undefined} style={{ minHeight: 400 }}>
      <FabMenu
        data-testid="target"
        icon={<AddIcon />}
        openIcon={<CloseIcon />}
        aria-label="Create"
        className={LAYOUT_OVERRIDES[override]}
      >
        {actions(2)}
      </FabMenu>
    </div>
  ),
};

/**
 * On a tall page, scrolled so the open menu reaches above the window: opening and closing it
 * never scrolls the page (it is never the browser's scroll anchor).
 */
export const ScrollAnchoring: Story = {
  render: () => (
    <TallPage>
      <FabMenu
        data-testid="menu"
        icon={<AddIcon />}
        openIcon={<CloseIcon />}
        aria-label="Create"
        className="absolute end-4 bottom-4"
      >
        {actions(4)}
      </FabMenu>
    </TallPage>
  ),
};
