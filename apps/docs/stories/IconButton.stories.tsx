import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  IconButton,
  type IconTransition,
  type ButtonShape,
  type ButtonSize,
  type IconButtonVariant,
  type IconButtonWidth,
} from '@windmorph/react';
import { useState } from 'react';
import { AddIcon, CloseIcon, RefreshIcon, SearchIcon, StarIcon, StarOutlineIcon } from './icons';
import { DensityColumns } from './density-columns';
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
    pending: { control: 'boolean' },
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

/** Disabled, per style: a plain button, an unselected toggle and a selected toggle. */
export const Disabled: Story = {
  render: () => (
    <div className="flex flex-col gap-4" data-testid="disabled">
      {VARIANTS.map((variant) => (
        <div key={variant} className="flex items-center gap-4">
          <span className="w-24 text-label-medium text-on-surface-variant">{variant}</span>
          <IconButton variant={variant} icon={<SearchIcon />} aria-label="Search" disabled />
          <IconButton
            toggle
            variant={variant}
            icon={<StarOutlineIcon />}
            aria-label="Star"
            disabled
          />
          <IconButton
            toggle
            defaultSelected
            variant={variant}
            icon={<StarOutlineIcon />}
            selectedIcon={<StarIcon />}
            aria-label="Starred"
            disabled
          />
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

/**
 * How `icon` becomes `selectedIcon`: `swap` at once, or `rotate`, a rotating crossfade beyond
 * the M3 spec, as in Google's Expressive showcase.
 */
export const IconTransitions: StoryObj<{ iconTransition: IconTransition }> = {
  args: { iconTransition: 'rotate' },
  argTypes: { iconTransition: { control: 'inline-radio', options: ['swap', 'rotate'] } },
  render: function IconTransitionsStory({ iconTransition }) {
    const [open, setOpen] = useState(false);
    return (
      <IconButton
        data-testid="toggle"
        toggle
        variant="tonal"
        size="md"
        shape="square"
        selected={open}
        onSelectedChange={setOpen}
        icon={<AddIcon />}
        selectedIcon={<CloseIcon />}
        iconTransition={iconTransition}
        aria-label="Add"
      />
    );
  },
};

/**
 * `pending` on every variant, size and width: the loading indicator (the icon's size, at least
 * 24px) replaces the icon after 200ms, and the button keeps its size. Each row is a density.
 */
export const Pending: StoryObj<{ pending: boolean }> = {
  args: { pending: true },
  render: ({ pending }) => (
    <DensityColumns className="grid-cols-1">
      {(density) => (
        <div className="flex flex-wrap items-center gap-3" data-testid={`pending-${density}`}>
          {SIZES.flatMap((size, s) =>
            WIDTHS.map((width, w) => (
              <IconButton
                key={`${size}-${width}`}
                density={density}
                size={size}
                width={width}
                variant={VARIANTS[(s + w) % VARIANTS.length]}
                pending={pending}
                icon={<RefreshIcon />}
                aria-label="Refresh"
                data-testid={`pending-${density}-${size}-${width}`}
              />
            )),
          )}
        </div>
      )}
    </DensityColumns>
  ),
};

/** Layout safety (architecture §10). */
export const LayoutOverride: StoryObj<{
  override: LayoutOverrideName;
  transformedAncestor: boolean;
  pending: boolean;
}> = {
  args: { override: 'none', transformedAncestor: false, pending: false },
  argTypes: { override: { control: 'select', options: LAYOUT_OVERRIDE_NAMES } },
  render: function LayoutOverrideStory({ override, transformedAncestor, pending }) {
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
          // Left out when off, so the default matrix renders the plain button.
          pending={pending || undefined}
          onPress={() => setCount((c) => c + 1)}
        />
      </div>
    );
  },
};

/**
 * Web density, 0 to -3: each step takes 4px off every size's height and width (S: 40 → 28px,
 * as Material Components Web's icon button density did), never below the icon plus 4px; the
 * touch targets stay 48 × 48px. Each level is a row: XS to M in every width and variant, then
 * L and XL.
 */
export const Density: Story = {
  render: () => (
    <DensityColumns className="grid-cols-1">
      {(density) => (
        <>
          <div className="flex flex-wrap items-center gap-3">
            {(['xs', 'sm', 'md'] as const).flatMap((size, s) =>
              WIDTHS.map((width, w) => (
                <IconButton
                  key={`${size}-${width}`}
                  density={density}
                  size={size}
                  width={width}
                  variant={VARIANTS[(s + w) % VARIANTS.length]}
                  icon={<SearchIcon />}
                  aria-label={`Search ${size} ${width}`}
                  data-testid={`${density}-${size}-${width}`}
                />
              )),
            )}
            <IconButton
              density={density}
              toggle
              defaultSelected
              shape="square"
              variant="tonal"
              icon={<StarOutlineIcon />}
              selectedIcon={<StarIcon />}
              aria-label="Favourite"
              data-testid={`${density}-toggle`}
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {(['lg', 'xl'] as const).flatMap((size) =>
              WIDTHS.map((width) => (
                <IconButton
                  key={`${size}-${width}`}
                  density={density}
                  size={size}
                  width={width}
                  variant="tonal"
                  icon={<AddIcon />}
                  aria-label={`Add ${size} ${width}`}
                  data-testid={`${density}-${size}-${width}`}
                />
              )),
            )}
          </div>
        </>
      )}
    </DensityColumns>
  ),
};
