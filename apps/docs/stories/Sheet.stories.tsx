import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  BottomSheet,
  Button,
  List,
  ListItem,
  SheetTrigger,
  SideSheet,
  Slider,
  type BottomSheetDetent,
} from '@windmorph/react';
import { useState } from 'react';
import { DeleteIcon, EditIcon, SendIcon, StarIcon } from './icons';
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

/**
 * Content that scrolls, with a row of filters that scrolls sideways. On a touch screen, a
 * drag down on the content at its top moves the sheet; otherwise the content scrolls.
 */
export const BottomScrolling: Story = {
  render: () => (
    <SheetTrigger>
      <Button>Open sheet</Button>
      <BottomSheet aria-label="Places" data-testid="sheet">
        {({ close }) => (
          <>
            <div className="flex gap-2 overflow-x-auto px-4 pb-2" data-testid="filters">
              {['Cafés', 'Parks', 'Museums', 'Markets', 'Libraries', 'Galleries', 'Gardens'].map(
                (name) => (
                  <Button key={name} variant="tonal" className="shrink-0">
                    {name}
                  </Button>
                ),
              )}
            </div>
            <Options count={24} onPick={close} />
          </>
        )}
      </BottomSheet>
    </SheetTrigger>
  ),
};

/**
 * A standard bottom sheet sits over the page without a scrim, collapsed to its peek height;
 * the page behind stays usable. Here it is placed in a bounded region.
 */
export const BottomStandard: Story = {
  render: function StandardBottomStory() {
    const [count, setCount] = useState(0);
    return (
      <div
        className="relative h-[600px] w-[412px] overflow-hidden border border-outline-variant"
        data-testid="layout"
      >
        <div className="flex flex-col items-start gap-4 p-6">
          <p className="text-body-large">Main content</p>
          <Button variant="tonal" onPress={() => setCount((c) => c + 1)}>
            {`Pressed ${count}`}
          </Button>
        </div>
        <BottomSheet
          variant="standard"
          aria-label="Now playing"
          classNames={{ container: 'absolute' }}
          data-testid="sheet"
        >
          <div className="px-6 pb-6">
            <p className="pb-4 text-title-medium">Now playing</p>
            <Options count={3} onPick={() => undefined} />
          </div>
        </BottomSheet>
      </div>
    );
  },
};

/**
 * A standard bottom sheet's detents. `defaultDetent="expanded"` opens it fully raised, and
 * its handle (a press, Enter or Space, or a drag) or Escape collapses it to its peek.
 * `controlled` passes `detent` from the page, whose button raises and lowers it too.
 */
export const BottomStandardDetents: StoryObj<{
  defaultDetent: BottomSheetDetent;
  controlled: boolean;
}> = {
  args: { defaultDetent: 'expanded', controlled: false },
  argTypes: {
    defaultDetent: { control: 'inline-radio', options: ['collapsed', 'expanded'] },
  },
  render: function StandardDetentsStory({ defaultDetent, controlled }) {
    const [open, setOpen] = useState(false);
    const [detent, setDetent] = useState<BottomSheetDetent>(defaultDetent);
    const [reported, setReported] = useState('none');
    return (
      <div
        className="relative h-[600px] w-[412px] overflow-hidden border border-outline-variant"
        data-testid="layout"
      >
        <div className="flex flex-col items-start gap-4 p-6">
          <Button variant="tonal" onPress={() => setOpen((value) => !value)}>
            {open ? 'Hide directions' : 'Show directions'}
          </Button>
          {controlled && (
            <Button
              variant="outlined"
              onPress={() =>
                setDetent((value) => (value === 'expanded' ? 'collapsed' : 'expanded'))
              }
            >
              {detent === 'expanded' ? 'Lower' : 'Raise'}
            </Button>
          )}
          <p className="text-body-medium text-on-surface-variant" data-testid="detent">
            {`Reported: ${reported}`}
          </p>
        </div>
        <BottomSheet
          variant="standard"
          aria-label="Directions"
          open={open}
          onOpenChange={setOpen}
          defaultDetent={defaultDetent}
          {...(controlled ? { detent } : {})}
          onDetentChange={(next) => {
            setReported(next);
            setDetent(next);
          }}
          classNames={{ container: 'absolute' }}
          data-testid="sheet"
        >
          <div className="px-6 pb-6">
            <p className="pb-4 text-title-medium">Directions</p>
            <Options count={5} onPick={() => undefined} />
          </div>
        </BottomSheet>
      </div>
    );
  },
};

const footer = ({ close }: { close: () => void }) => (
  <>
    <Button onPress={close}>Apply</Button>
    <Button variant="outlined" onPress={close}>
      Cancel
    </Button>
  </>
);

/**
 * A modal side sheet, docked or detached, with its built-in close button and bottom actions.
 * `edge` puts it on the start edge. `wide` adds content wider than the sheet, which is
 * clipped: side sheets never scroll sideways. `widePanel` asks for a 480px sheet, which stops
 * at the spec's 400px maximum.
 */
export const Side: StoryObj<{
  edge: 'start' | 'end';
  detached: boolean;
  back: boolean;
  wide: boolean;
  widePanel: boolean;
}> = {
  args: { edge: 'end', detached: false, back: false, wide: false, widePanel: false },
  argTypes: { edge: { control: 'inline-radio', options: ['end', 'start'] } },
  render: ({ edge, detached, back, wide, widePanel }) => (
    <SheetTrigger>
      <Button>Open filters</Button>
      <SideSheet
        title="Filters"
        edge={edge}
        detached={detached}
        onBack={back ? () => undefined : undefined}
        footer={footer}
        footerDivider
        classNames={widePanel ? { panel: 'w-[480px]' } : undefined}
        data-testid="sheet"
      >
        <p className="text-body-medium text-on-surface-variant">
          Filter the results by date, type and owner.
        </p>
        {wide && (
          <p className="w-[600px] text-body-medium text-on-surface-variant" data-testid="wide">
            Results shared by Alex, Sam and Priya across every team this quarter.
          </p>
        )}
      </SideSheet>
    </SheetTrigger>
  ),
};

/**
 * A standard side sheet beside the content; it opens and closes its width. With
 * `edge="start"` the app puts it first in its row, and its divider faces the content.
 */
export const SideStandard: StoryObj<{ edge: 'start' | 'end' }> = {
  args: { edge: 'end' },
  argTypes: { edge: { control: 'inline-radio', options: ['end', 'start'] } },
  render: function StandardStory({ edge }) {
    const [open, setOpen] = useState(true);
    const sheet = (
      <SideSheet
        variant="standard"
        title="Details"
        edge={edge}
        open={open}
        onOpenChange={setOpen}
        data-testid="sheet"
      >
        <p className="text-body-medium text-on-surface-variant">
          Supplementary content that sits beside the page.
        </p>
      </SideSheet>
    );
    return (
      <div
        className="flex h-[360px] w-[720px] overflow-hidden rounded-corner-large border border-outline-variant"
        data-testid="layout"
      >
        {edge === 'start' && sheet}
        <div className="flex flex-1 flex-col items-start gap-4 p-6">
          <p className="text-body-large">Main content</p>
          <Button variant="tonal" onPress={() => setOpen((v) => !v)}>
            {open ? 'Hide details' : 'Show details'}
          </Button>
        </div>
        {edge === 'end' && sheet}
      </div>
    );
  },
};

/**
 * Swipe to dismiss on a touch screen: a swipe toward the sheet's edge closes it past half
 * its width or on a fling, while a vertical swipe scrolls the long content, and the row of
 * filters (a horizontal scroller) and the slider keep their own sideways drags. `veto` keeps
 * the sheet open (a controlled `open` left `true`), so a swipe springs back; `swipeable`
 * turns the gesture off.
 */
export const SideSwipe: StoryObj<{
  edge: 'start' | 'end';
  veto: boolean;
  swipeable: boolean;
}> = {
  args: { edge: 'end', veto: false, swipeable: true },
  argTypes: { edge: { control: 'inline-radio', options: ['end', 'start'] } },
  render: function SwipeStory({ edge, veto, swipeable }) {
    const [open, setOpen] = useState(false);
    const [asked, setAsked] = useState(0);
    return (
      <div className="flex flex-col items-start gap-4">
        <Button onPress={() => setOpen(true)}>Open filters</Button>
        <p className="text-body-medium" data-testid="asked">{`Close requests: ${asked}`}</p>
        <SideSheet
          title="Filters"
          edge={edge}
          swipeable={swipeable}
          open={open}
          onOpenChange={(next) => {
            if (!next) setAsked((count) => count + 1);
            if (next || !veto) setOpen(next);
          }}
          footer={({ close }) => <Button onPress={close}>Apply</Button>}
          data-testid="sheet"
        >
          <div className="flex gap-2 overflow-x-auto pb-4" data-testid="filters">
            {['Cafés', 'Parks', 'Museums', 'Markets', 'Libraries', 'Galleries', 'Gardens'].map(
              (name) => (
                <Button key={name} variant="tonal" className="shrink-0">
                  {name}
                </Button>
              ),
            )}
          </div>
          <Slider aria-label="Distance" defaultValue={40} data-testid="slider" className="pb-4" />
          <div data-testid="long">
            {Array.from({ length: 30 }, (_, index) => (
              <p key={index} className="py-2 text-body-medium text-on-surface-variant">
                {`Result ${index + 1}: shared by Alex, Sam or Priya.`}
              </p>
            ))}
          </div>
        </SideSheet>
      </div>
    );
  },
};

/** Layout safety (architecture §10) for the in-flow standard side sheet. */
export const LayoutOverride: StoryObj<{
  override: LayoutOverrideName;
  transformedAncestor: boolean;
  edge: 'start' | 'end';
}> = {
  args: { override: 'none', transformedAncestor: false, edge: 'end' },
  argTypes: {
    override: { control: 'select', options: LAYOUT_OVERRIDE_NAMES },
    edge: { control: 'inline-radio', options: ['end', 'start'] },
  },
  render: function LayoutOverrideStory({ override, transformedAncestor, edge }) {
    const [count, setCount] = useState(0);
    return (
      <div className={transformedAncestor ? 'translate-x-2' : undefined} style={{ minHeight: 360 }}>
        <p className="mb-4 text-body-medium" data-testid="count">
          Pressed {count}
        </p>
        <SideSheet
          variant="standard"
          title="Details"
          edge={edge}
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

/** The same layout-safety matrix for a standard side sheet on the start edge. */
export const LayoutOverrideStart: typeof LayoutOverride = {
  ...LayoutOverride,
  args: { ...LayoutOverride.args, edge: 'start' },
};

/**
 * Layout safety (architecture §10) for the bottom sheet: a consumer layout class on a
 * standard bottom sheet placed in a bounded region (`className`, which goes on its
 * outermost element, the container that `classNames.container` places in the region),
 * inside an optional transformed ancestor.
 */
export const BottomLayoutOverride: StoryObj<{
  override: LayoutOverrideName;
  transformedAncestor: boolean;
}> = {
  args: { override: 'none', transformedAncestor: false },
  argTypes: { override: { control: 'select', options: LAYOUT_OVERRIDE_NAMES } },
  render: ({ override, transformedAncestor }) => (
    <div className={transformedAncestor ? 'translate-x-2' : undefined}>
      <div className="relative h-[480px] w-[412px] overflow-hidden" data-testid="layout">
        <BottomSheet
          variant="standard"
          aria-label="Now playing"
          data-testid="target"
          classNames={{ container: 'absolute' }}
          className={LAYOUT_OVERRIDES[override]}
        >
          <div className="px-6 pb-6">
            <p className="text-title-medium">Now playing</p>
          </div>
        </BottomSheet>
      </div>
    </div>
  ),
};
