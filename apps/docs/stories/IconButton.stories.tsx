import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  IconButton,
  type ButtonShape,
  type ButtonSize,
  type IconButtonVariant,
  type IconButtonWidth,
} from '@windmorph/react';
import { useState } from 'react';
import { SearchIcon, StarIcon, StarOutlineIcon } from './icons';
import {
  LAYOUT_OVERRIDES,
  LAYOUT_OVERRIDE_NAMES,
  type LayoutOverrideName,
} from './layout-overrides';

const VARIANTS: IconButtonVariant[] = ['filled', 'tonal', 'outlined', 'standard'];
const SIZES: ButtonSize[] = ['xs', 'sm', 'md', 'lg', 'xl'];
const WIDTHS: IconButtonWidth[] = ['narrow', 'default', 'wide'];
const SHAPES: ButtonShape[] = ['round', 'square'];

const meta = {
  title: 'Components/IconButton',
  component: IconButton,
  args: { icon: <SearchIcon />, 'aria-label': 'Search', variant: 'filled', size: 'sm' },
  argTypes: {
    variant: { control: 'inline-radio', options: VARIANTS },
    size: { control: 'inline-radio', options: SIZES },
    width: { control: 'inline-radio', options: WIDTHS },
    shape: { control: 'inline-radio', options: SHAPES },
    disabled: { control: 'boolean' },
    tooltip: { control: 'boolean' },
    icon: { control: false },
  },
} satisfies Meta<typeof IconButton>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Hover or focus it: the `aria-label` shows as a plain tooltip. */
export const Playground: Story = {};

/**
 * Every variant: enabled, as an unselected and selected toggle, and disabled. Standard
 * and outlined icons are `on-surface-variant`, whatever the surrounding text colour.
 */
export const Variants: Story = {
  render: () => (
    <div className="flex flex-col gap-4 text-on-surface" data-testid="variants">
      {VARIANTS.map((variant) => (
        <div key={variant} className="flex items-center gap-4">
          <span className="w-24 text-label-medium text-on-surface-variant">{variant}</span>
          <IconButton variant={variant} icon={<SearchIcon />} aria-label="Search" />
          <IconButton toggle variant={variant} icon={<StarOutlineIcon />} aria-label="Star" />
          <IconButton
            toggle
            defaultSelected
            variant={variant}
            icon={<StarOutlineIcon />}
            selectedIcon={<StarIcon />}
            aria-label="Starred"
          />
          <IconButton variant={variant} icon={<SearchIcon />} aria-label="Search" disabled />
        </div>
      ))}
    </div>
  ),
};

/**
 * A container sets `--md-comp-icon-button-icon-color` to give its standard and outlined
 * icon buttons another content colour; `currentColor` inherits its own.
 */
export const ContentColor: Story = {
  render: () => (
    <div
      className="flex items-center gap-4 rounded-corner-large bg-primary-container p-4 text-on-primary-container [--md-comp-icon-button-icon-color:currentColor]"
      data-testid="content-color"
    >
      <IconButton variant="standard" icon={<SearchIcon />} aria-label="Search" />
      <IconButton variant="outlined" icon={<StarOutlineIcon />} aria-label="Star" />
    </div>
  ),
};

/** XS–XL in narrow, default and wide widths, round and square. */
export const SizesAndWidths: Story = {
  render: () => (
    <div className="flex flex-col gap-6" data-testid="sizes">
      {SHAPES.map((shape) =>
        WIDTHS.map((width) => (
          <div key={`${shape}-${width}`} className="flex items-center gap-4">
            <span className="w-28 text-label-medium text-on-surface-variant">
              {shape} · {width}
            </span>
            {SIZES.map((size) => (
              <IconButton
                key={size}
                variant="tonal"
                size={size}
                width={width}
                shape={shape}
                icon={<SearchIcon />}
                aria-label={`Search ${size}`}
              />
            ))}
          </div>
        )),
      )}
    </div>
  ),
};

/** A favourite toggle that swaps to the filled star when selected. */
export const Toggle: Story = {
  render: function ToggleStory() {
    const [favourite, setFavourite] = useState(false);
    return (
      <IconButton
        toggle
        variant="filled"
        size="md"
        selected={favourite}
        onSelectedChange={setFavourite}
        icon={<StarOutlineIcon />}
        selectedIcon={<StarIcon />}
        aria-label="Favourite"
      />
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
      <div className={transformedAncestor ? 'translate-x-2' : undefined} style={{ minHeight: 200 }}>
        <p className="mb-4 text-body-medium" data-testid="count">
          Pressed {count}
        </p>
        <IconButton
          data-testid="target"
          variant="filled"
          className={LAYOUT_OVERRIDES[override]}
          icon={<SearchIcon />}
          aria-label="Search"
          onPress={() => setCount((c) => c + 1)}
        />
      </div>
    );
  },
};
