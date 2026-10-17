import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button, ButtonGroup, IconButton, ThemeScope, type ButtonSize } from '@windmorph/react';
import { useState } from 'react';
import {
  AddIcon,
  DeleteIcon,
  EditIcon,
  FormatBoldIcon,
  FormatItalicIcon,
  FormatUnderlinedIcon,
  SearchIcon,
  StarIcon,
  StarOutlineIcon,
} from './icons';
import { DensityColumns } from './density-columns';
import {
  LAYOUT_OVERRIDES,
  LAYOUT_OVERRIDE_NAMES,
  type LayoutOverrideName,
} from './layout-overrides';

const SIZES: ButtonSize[] = ['xs', 'sm', 'md', 'lg', 'xl'];

const meta = {
  title: 'Composites/ButtonGroup',
  component: ButtonGroup,
  args: { variant: 'standard', size: 'sm', 'aria-label': 'Actions' },
  argTypes: {
    variant: { control: 'inline-radio', options: ['standard', 'connected'] },
    size: { control: 'inline-radio', options: SIZES },
    expandedRatio: { control: { type: 'range', min: 0, max: 0.5, step: 0.05 } },
  },
  render: (args) => (
    <ButtonGroup {...args}>
      <Button leadingIcon={<AddIcon />}>Create</Button>
      <Button variant="tonal">Share</Button>
      <Button variant="outlined">Archive</Button>
      <IconButton variant="tonal" icon={<StarIcon />} aria-label="Favourite" />
    </ButtonGroup>
  ),
} satisfies Meta<typeof ButtonGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Press a button: it grows while its neighbours shrink, keeping the group's width. Tab
 * reaches the group and the arrow keys move between its buttons.
 */
export const Standard: Story = {};

/**
 * Standard groups at every size (18 / 12 / 8 / 8 / 8px apart), then connected groups,
 * round and square, spanning a 560px container.
 */
export const Sizes: Story = {
  render: () => (
    <div className="flex w-[560px] flex-col items-start gap-6" data-testid="sizes">
      {SIZES.map((size) => (
        <ButtonGroup key={size} size={size} buttonVariant="tonal" aria-label={`Standard ${size}`}>
          <Button>One</Button>
          <Button>Two</Button>
          <IconButton variant="tonal" icon={<SearchIcon />} aria-label="Search" />
        </ButtonGroup>
      ))}
      {SIZES.map((size) => (
        <div key={size} className="flex w-full flex-col gap-2">
          {(['round', 'square'] as const).map((shape) => (
            <ButtonGroup
              key={shape}
              variant="connected"
              shape={shape}
              size={size}
              buttonVariant="tonal"
              aria-label={`Connected ${shape} ${size}`}
            >
              <Button>One</Button>
              <Button>Two</Button>
              <IconButton variant="tonal" icon={<SearchIcon />} aria-label="Search" />
            </ButtonGroup>
          ))}
        </div>
      ))}
    </div>
  ),
};

/** Connected single selection: the M3 Expressive replacement for segmented buttons. */
export const ConnectedSingleSelection: Story = {
  render: function ConnectedStory() {
    const [view, setView] = useState(new Set(['week']));
    return (
      <div className="flex w-[480px] flex-col items-start gap-4" data-testid="connected">
        <ButtonGroup
          variant="connected"
          selectionMode="single"
          disallowEmptySelection
          selectedKeys={view}
          onSelectionChange={setView}
          aria-label="Calendar view"
        >
          <Button toggle value="day">
            Day
          </Button>
          <Button toggle value="week">
            Week
          </Button>
          <Button toggle value="month">
            Month
          </Button>
          <Button toggle value="year">
            Year
          </Button>
        </ButtonGroup>
        <p className="text-body-medium text-on-surface-variant" data-testid="selection">
          {[...view].join(', ')}
        </p>
      </div>
    );
  },
};

/** Connected multiple selection with XS icon buttons, at least 48px wide each. */
export const ConnectedMultipleSelection: Story = {
  render: () => (
    <ButtonGroup
      variant="connected"
      size="xs"
      className="w-fit"
      selectionMode="multiple"
      defaultSelectedKeys={['bold']}
      aria-label="Text format"
      data-testid="format"
    >
      <IconButton toggle variant="tonal" value="bold" icon={<FormatBoldIcon />} aria-label="Bold" />
      <IconButton
        toggle
        variant="tonal"
        value="italic"
        icon={<FormatItalicIcon />}
        aria-label="Italic"
      />
      <IconButton
        toggle
        variant="tonal"
        value="underline"
        icon={<FormatUnderlinedIcon />}
        aria-label="Underline"
      />
    </ButtonGroup>
  ),
};

/**
 * Connected groups sized by their content (`w-fit`) at every size: every button takes the
 * widest one's natural width, so the longest label keeps its full padding. With too little
 * room (240px), a button shrinks no further than its minimum, here its content. Last, a group
 * with a definite width shares it equally.
 */
export const ContentSized: Story = {
  render: () => (
    <div className="flex flex-col items-start gap-4" data-testid="content-sized">
      {SIZES.map((size) => (
        <ButtonGroup
          key={size}
          variant="connected"
          size={size}
          className="w-fit"
          selectionMode="single"
          defaultSelectedKeys={['going']}
          aria-label={`Reply ${size}`}
        >
          <Button toggle value="going">
            Going
          </Button>
          <Button toggle value="not-going">
            Not going
          </Button>
          <Button toggle value="maybe">
            Maybe
          </Button>
        </ButtonGroup>
      ))}
      <ButtonGroup
        variant="connected"
        className="w-fit"
        selectionMode="multiple"
        aria-label="Reply with icons"
      >
        <Button
          toggle
          value="star"
          leadingIcon={<StarOutlineIcon />}
          selectedLeadingIcon={<StarIcon />}
        >
          Star
        </Button>
        <IconButton toggle value="edit" icon={<EditIcon />} aria-label="Edit" />
        <Button toggle value="later">
          Remind me later
        </Button>
      </ButtonGroup>
      <div className="w-[240px]">
        <ButtonGroup
          variant="connected"
          size="md"
          className="w-fit"
          selectionMode="single"
          aria-label="Reply, too little room"
        >
          <Button toggle value="going">
            Going
          </Button>
          <Button toggle value="not-going">
            Not going
          </Button>
          <Button toggle value="maybe">
            Maybe
          </Button>
        </ButtonGroup>
      </div>
      <ButtonGroup
        variant="connected"
        className="w-[480px]"
        selectionMode="single"
        aria-label="Reply, fixed width"
      >
        <Button toggle value="going">
          Going
        </Button>
        <Button toggle value="not-going">
          Not going
        </Button>
        <Button toggle value="maybe">
          Maybe
        </Button>
      </ButtonGroup>
    </div>
  ),
};

/** Variants in standard and connected groups, with one selected item each. */
export const Variants: Story = {
  render: () => (
    <div className="flex flex-col items-start gap-4" data-testid="variants">
      {(['filled', 'tonal', 'outlined', 'elevated'] as const).map((buttonVariant) => (
        <div key={buttonVariant} className="flex w-[640px] items-center gap-8">
          <ButtonGroup buttonVariant={buttonVariant} aria-label={`${buttonVariant} actions`}>
            <Button>Copy</Button>
            <Button>Paste</Button>
            <Button disabled>Cut</Button>
          </ButtonGroup>
          <ButtonGroup
            variant="connected"
            buttonVariant={buttonVariant}
            selectionMode="single"
            defaultSelectedKeys={['b']}
            aria-label={`${buttonVariant} options`}
          >
            <Button toggle value="a">
              Alpha
            </Button>
            <Button toggle value="b">
              Beta
            </Button>
            <Button toggle value="c">
              Gamma
            </Button>
          </ButtonGroup>
        </div>
      ))}
    </div>
  ),
};

/**
 * `overflow`: the trailing buttons that don't fit fold into a "More options" menu. Drag the
 * `width` control (or resize the window) and they come back as room opens up.
 */
export const Overflow: StoryObj<{ width: number }> = {
  args: { width: 320 },
  argTypes: { width: { control: { type: 'range', min: 120, max: 720, step: 10 } } },
  render: function OverflowStory({ width }) {
    const [last, setLast] = useState('none');
    const [view, setView] = useState(new Set(['week']));
    return (
      <div className="flex flex-col gap-6" style={{ width }} data-testid="overflow">
        <ButtonGroup aria-label="Message actions" overflow data-testid="standard">
          <Button leadingIcon={<EditIcon />} onPress={() => setLast('reply')}>
            Reply
          </Button>
          <Button variant="tonal" onPress={() => setLast('forward')}>
            Forward
          </Button>
          <Button
            variant="tonal"
            toggle
            leadingIcon={<StarOutlineIcon />}
            selectedLeadingIcon={<StarIcon />}
          >
            Star
          </Button>
          <Button variant="outlined" onPress={() => setLast('archive')}>
            Archive
          </Button>
          <IconButton variant="tonal" icon={<DeleteIcon />} aria-label="Delete" disabled />
        </ButtonGroup>
        <ButtonGroup
          variant="connected"
          overflow
          selectionMode="single"
          disallowEmptySelection
          selectedKeys={view}
          onSelectionChange={setView}
          aria-label="Calendar view"
          data-testid="connected"
        >
          <Button toggle value="day">
            Day
          </Button>
          <Button toggle value="week">
            Week
          </Button>
          <Button toggle value="month">
            Month
          </Button>
          <Button toggle value="year">
            Year
          </Button>
        </ButtonGroup>
        <p className="text-body-medium text-on-surface-variant" data-testid="last">
          Last: {last} · View: {[...view].join(', ')}
        </p>
      </div>
    );
  },
};

/** Layout safety (architecture §10) for the group root. */
export const LayoutOverride: StoryObj<{
  override: LayoutOverrideName;
  transformedAncestor: boolean;
  connected: boolean;
}> = {
  args: { override: 'none', transformedAncestor: false, connected: false },
  argTypes: { override: { control: 'select', options: LAYOUT_OVERRIDE_NAMES } },
  render: function LayoutOverrideStory({ override, transformedAncestor, connected }) {
    const [count, setCount] = useState(0);
    return (
      <div className={transformedAncestor ? 'translate-x-2' : undefined} style={{ minHeight: 200 }}>
        <p className="mb-4 text-body-medium" data-testid="count">
          Pressed {count}
        </p>
        <ButtonGroup
          data-testid="target"
          variant={connected ? 'connected' : 'standard'}
          className={LAYOUT_OVERRIDES[override]}
          aria-label="Actions"
        >
          <Button onPress={() => setCount((c) => c + 1)}>One</Button>
          <Button>Two</Button>
          <Button>Three</Button>
        </ButtonGroup>
      </div>
    );
  },
};

/**
 * Groups of icon buttons under a dense `ThemeScope` (M3: "Button groups adapt to density of the
 * buttons inside"): their buttons lose 4px a step, standard XS and S groups widen their gaps
 * so neighbouring 48px targets never overlap, and a connected XS group keeps its 48px-wide
 * buttons.
 */
export const Density: Story = {
  render: () => (
    <DensityColumns>
      {(density) => (
        <ThemeScope density={density}>
          <div className="flex flex-col items-start gap-4">
            {(['xs', 'sm', 'md'] as const).map((size) => (
              <ButtonGroup
                key={size}
                size={size}
                buttonVariant="tonal"
                aria-label={`Formatting ${size}`}
                data-testid={`${density}-standard-${size}`}
              >
                <IconButton icon={<FormatBoldIcon />} aria-label="Bold" />
                <IconButton icon={<FormatItalicIcon />} aria-label="Italic" />
                <IconButton icon={<FormatUnderlinedIcon />} aria-label="Underline" />
              </ButtonGroup>
            ))}
            <ButtonGroup
              variant="connected"
              size="xs"
              buttonVariant="tonal"
              className="w-fit"
              aria-label="Connected formatting"
              data-testid={`${density}-connected-xs`}
            >
              <IconButton icon={<FormatBoldIcon />} aria-label="Bold" />
              <IconButton icon={<FormatItalicIcon />} aria-label="Italic" />
              <IconButton icon={<FormatUnderlinedIcon />} aria-label="Underline" />
            </ButtonGroup>
          </div>
        </ThemeScope>
      )}
    </DensityColumns>
  ),
};

/**
 * Narrow icon buttons in standard groups, at every density: the gap grows to 48px minus the
 * narrow width wherever the spec's is smaller, so neighbouring 48px targets never overlap.
 */
export const NarrowDensity: Story = {
  render: () => (
    <DensityColumns>
      {(density) => (
        <ThemeScope density={density}>
          <div className="flex flex-col items-start gap-4">
            {(['xs', 'sm', 'md'] as const).map((size) => (
              <ButtonGroup
                key={size}
                size={size}
                buttonVariant="tonal"
                aria-label={`Narrow formatting ${size}`}
                data-testid={`${density}-narrow-${size}`}
              >
                <IconButton icon={<FormatBoldIcon />} aria-label="Bold" width="narrow" />
                <IconButton icon={<FormatItalicIcon />} aria-label="Italic" width="narrow" />
                <IconButton icon={<FormatUnderlinedIcon />} aria-label="Underline" width="narrow" />
              </ButtonGroup>
            ))}
          </div>
        </ThemeScope>
      )}
    </DensityColumns>
  ),
};
