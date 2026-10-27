import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  ExtendedFab,
  Fab,
  type ExtendedFabSize,
  type FabColor,
  type FabElevation,
  type FabSize,
} from '@windmorph/react';
import { useState } from 'react';
import { EditIcon } from './icons';
import { TallPage } from './scroll-anchoring';
import {
  LAYOUT_OVERRIDES,
  LAYOUT_OVERRIDE_NAMES,
  type LayoutOverrideName,
} from './layout-overrides';

const COLORS: FabColor[] = [
  'primary-container',
  'secondary-container',
  'tertiary-container',
  'primary',
  'secondary',
  'tertiary',
];
const SIZES: FabSize[] = ['default', 'md', 'lg'];
const EXTENDED_SIZES: ExtendedFabSize[] = ['sm', 'md', 'lg'];
const ELEVATIONS: FabElevation[] = ['default', 'lowered', 'flat'];

const meta = {
  title: 'Components/FAB',
  component: Fab,
  args: {
    icon: <EditIcon />,
    'aria-label': 'Compose',
    size: 'default',
    color: 'primary-container',
  },
  argTypes: {
    size: { control: 'inline-radio', options: SIZES },
    color: { control: 'select', options: COLORS },
    elevation: { control: 'inline-radio', options: ELEVATIONS },
    visible: { control: 'boolean' },
    tooltip: { control: 'boolean' },
    icon: { control: false },
  },
} satisfies Meta<typeof Fab>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** Every colour style at every size, plus the lowered and flat (level 0) elevations. */
export const ColorsAndSizes: Story = {
  render: () => (
    <div className="flex flex-col gap-6" data-testid="fabs">
      {COLORS.map((color) => (
        <div key={color} className="flex items-center gap-6">
          <span className="w-36 text-label-medium text-on-surface-variant">{color}</span>
          {SIZES.map((size) => (
            <Fab
              key={size}
              color={color}
              size={size}
              icon={<EditIcon />}
              aria-label={`${color} ${size}`}
            />
          ))}
          <Fab
            color={color}
            elevation="lowered"
            icon={<EditIcon />}
            aria-label={`${color} lowered`}
          />
          <Fab color={color} elevation="flat" icon={<EditIcon />} aria-label={`${color} flat`} />
        </div>
      ))}
    </div>
  ),
};

/** Extended FABs at each size, with an icon and text-only. */
export const Extended: Story = {
  render: () => (
    <div className="flex flex-col items-start gap-6" data-testid="extended">
      {EXTENDED_SIZES.map((size) => (
        <div key={size} className="flex items-center gap-6">
          <ExtendedFab size={size} icon={<EditIcon />}>
            Compose
          </ExtendedFab>
          <ExtendedFab size={size} color="tertiary-container">
            Text only
          </ExtendedFab>
          <ExtendedFab size={size} icon={<EditIcon />} expanded={false}>
            Collapsed
          </ExtendedFab>
        </div>
      ))}
    </div>
  ),
};

/** Collapses to the icon and expands again (e.g. while scrolling). */
export const ExtendedCollapse: StoryObj<{ size: ExtendedFabSize }> = {
  args: { size: 'sm' },
  argTypes: { size: { control: 'inline-radio', options: EXTENDED_SIZES } },
  render: function CollapseStory({ size }) {
    const [expanded, setExpanded] = useState(true);
    return (
      <div className="flex flex-col items-start gap-6">
        <button
          type="button"
          className="text-label-large text-primary underline"
          onClick={() => setExpanded((value) => !value)}
        >
          {expanded ? 'Collapse' : 'Expand'}
        </button>
        <ExtendedFab size={size} icon={<EditIcon />} expanded={expanded} data-testid="extended-fab">
          Compose
        </ExtendedFab>
      </div>
    );
  },
};

/**
 * Disappears towards its centre and reappears (`visible`), e.g. around a page change; a
 * new `key` with `appear` replays the entrance, e.g. on a tab change.
 */
export const Visibility: Story = {
  render: function VisibilityStory() {
    const [visible, setVisible] = useState(true);
    const [tab, setTab] = useState(0);
    return (
      <div className="flex flex-col items-start gap-6">
        <div className="flex gap-4">
          <button
            type="button"
            className="text-label-large text-primary underline"
            onClick={() => setVisible((value) => !value)}
          >
            {visible ? 'Hide' : 'Show'}
          </button>
          <button
            type="button"
            className="text-label-large text-primary underline"
            onClick={() => setTab((value) => value + 1)}
          >
            Next tab
          </button>
        </div>
        <div className="flex items-center gap-6">
          <Fab
            data-testid="fab"
            visible={visible}
            size="md"
            icon={<EditIcon />}
            aria-label="Compose"
          />
          <Fab key={tab} appear icon={<EditIcon />} aria-label={`Tab ${tab + 1} action`} />
          <ExtendedFab data-testid="extended-fab" visible={visible} icon={<EditIcon />}>
            Compose
          </ExtendedFab>
        </div>
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
      <div className={transformedAncestor ? 'translate-x-2' : undefined} style={{ minHeight: 200 }}>
        <p className="mb-4 text-body-medium" data-testid="count">
          Pressed {count}
        </p>
        <Fab
          data-testid="target"
          className={LAYOUT_OVERRIDES[override]}
          icon={<EditIcon />}
          aria-label="Compose"
          onPress={() => setCount((c) => c + 1)}
        />
      </div>
    );
  },
};

/**
 * On a tall page, an extended FAB's label collapses and expands from a fixed button without
 * scrolling the page (it is never the browser's scroll anchor).
 */
export const ScrollAnchoring: Story = {
  render: function ScrollAnchoringStory() {
    const [expanded, setExpanded] = useState(true);
    return (
      <TallPage onToggle={() => setExpanded((value) => !value)}>
        <ExtendedFab
          data-testid="fab"
          icon={<EditIcon />}
          expanded={expanded}
          className="absolute end-4 bottom-4"
        >
          Compose
        </ExtendedFab>
      </TallPage>
    );
  },
};
