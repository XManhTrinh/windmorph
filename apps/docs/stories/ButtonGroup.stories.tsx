import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button, ButtonGroup, IconButton, type ButtonSize } from '@windmorph/react';
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
