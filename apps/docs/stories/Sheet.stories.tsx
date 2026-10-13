import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  BottomSheet,
  Button,
  IconButton,
  List,
  ListItem,
  SheetTrigger,
  SideSheet,
} from '@windmorph/react';
import { useState } from 'react';
import { CloseIcon, DeleteIcon, EditIcon, SendIcon, StarIcon } from './icons';
import {
  LAYOUT_OVERRIDES,
  LAYOUT_OVERRIDE_NAMES,
  type LayoutOverrideName,
} from './layout-overrides';

const meta = { title: 'Components/Sheet' } satisfies Meta;

export default meta;
type Story = StoryObj;

function Options({ count, onPick }: { count: number; onPick: () => void }) {
  const icons = [
    <SendIcon key="s" />,
    <StarIcon key="t" />,
    <EditIcon key="e" />,
    <DeleteIcon key="d" />,
  ];
  return (
    <List aria-label="Options" onAction={onPick}>
      {Array.from({ length: count }, (_, index) => (
        <ListItem key={String(index)} leading={icons[index % icons.length]}>
          {`Option ${index + 1}`}
        </ListItem>
      ))}
    </List>
  );
}

/** A short bottom sheet opens fully; press the handle or drag it down to close. */
export const Bottom: StoryObj<{ items: number }> = {
  args: { items: 4 },
  render: ({ items }) => (
    <SheetTrigger>
      <Button>Open sheet</Button>
      <BottomSheet aria-label="Options" data-testid="sheet">
        {({ close }) => (
          <div className="pb-6">
            <Options count={items} onPick={close} />
          </div>
        )}
      </BottomSheet>
    </SheetTrigger>
  ),
};

/** A tall sheet opens to half the window; drag up or press the handle to expand. */
export const BottomTall: Story = {
  render: () => (
    <SheetTrigger>
      <Button>Open sheet</Button>
      <BottomSheet aria-label="All options" data-testid="sheet">
        {({ close }) => <Options count={24} onPick={close} />}
      </BottomSheet>
    </SheetTrigger>
  ),
};

const closeAction = ({ close }: { close: () => void }) => (
  <IconButton icon={<CloseIcon />} aria-label="Close" onPress={close} />
);

/** A modal side sheet, docked or detached. */
export const Side: StoryObj<{ detached: boolean }> = {
  args: { detached: false },
  render: ({ detached }) => (
    <SheetTrigger>
      <Button>Open filters</Button>
      <SideSheet title="Filters" detached={detached} actions={closeAction} data-testid="sheet">
        <p className="text-body-medium text-on-surface-variant">
          Filter the results by date, type and owner.
        </p>
      </SideSheet>
    </SheetTrigger>
  ),
};

/** A standard side sheet beside the content; it opens and closes its width. */
export const SideStandard: Story = {
  render: function StandardStory() {
    const [open, setOpen] = useState(true);
    return (
      <div
        className="flex h-[360px] w-[720px] overflow-hidden rounded-corner-large border border-outline-variant"
        data-testid="layout"
      >
        <div className="flex flex-1 flex-col items-start gap-4 p-6">
          <p className="text-body-large">Main content</p>
          <Button variant="tonal" onPress={() => setOpen((v) => !v)}>
            {open ? 'Hide details' : 'Show details'}
          </Button>
        </div>
        <SideSheet
          variant="standard"
          title="Details"
          open={open}
          onOpenChange={setOpen}
          actions={closeAction}
          data-testid="sheet"
        >
          <p className="text-body-medium text-on-surface-variant">
            Supplementary content that sits beside the page.
          </p>
        </SideSheet>
      </div>
    );
  },
};

/** Layout safety (architecture §10) for the in-flow standard side sheet. */
export const LayoutOverride: StoryObj<{
  override: LayoutOverrideName;
  transformedAncestor: boolean;
}> = {
  args: { override: 'none', transformedAncestor: false },
  argTypes: { override: { control: 'select', options: LAYOUT_OVERRIDE_NAMES } },
  render: function LayoutOverrideStory({ override, transformedAncestor }) {
    const [count, setCount] = useState(0);
    return (
      <div className={transformedAncestor ? 'translate-x-2' : undefined} style={{ minHeight: 360 }}>
        <p className="mb-4 text-body-medium" data-testid="count">
          Pressed {count}
        </p>
        <SideSheet
          variant="standard"
          title="Details"
          data-testid="target"
          style={{ height: 300 }}
          className={LAYOUT_OVERRIDES[override]}
          actions={
            <Button variant="text" onPress={() => setCount((c) => c + 1)}>
              Action
            </Button>
          }
        >
          Body
        </SideSheet>
      </div>
    );
  },
};
