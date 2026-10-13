import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  DialogTrigger,
  IconButton,
  Menu,
  MenuItem,
  MenuTrigger,
  RichTooltip,
  RichTooltipTrigger,
  Tooltip,
  TooltipTrigger,
  TopAppBar,
  type TooltipPlacement,
} from '@windmorph/react';
import { ArrowBackIcon, DeleteIcon, EditIcon, MoreVertIcon, SearchIcon, StarIcon } from './icons';

interface Args {
  placement: TooltipPlacement;
  caret: boolean;
}

const meta = {
  title: 'Components/Tooltip',
  args: { placement: 'top', caret: false },
  argTypes: {
    placement: {
      control: 'select',
      options: [
        'top',
        'bottom',
        'left',
        'right',
        'start',
        'end',
        'top start',
        'top end',
        'bottom start',
        'bottom end',
      ],
    },
  },
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

/** Plain tooltips on icon buttons: hover or focus them. */
export const Plain: Story = {
  render: ({ placement, caret }) => (
    <div className="flex gap-2 p-16" data-testid="plain">
      {[
        { icon: <StarIcon />, label: 'Favourite', tip: 'Add to favourites' },
        { icon: <EditIcon />, label: 'Edit', tip: 'Edit message' },
        { icon: <SearchIcon />, label: 'Search', tip: 'Search messages in all folders' },
      ].map(({ icon, label, tip }) => (
        <TooltipTrigger key={label} placement={placement}>
          <IconButton variant="standard" icon={icon} aria-label={label} />
          <Tooltip caret={caret}>{tip}</Tooltip>
        </TooltipTrigger>
      ))}
    </div>
  ),
};

/** Tooltips on buttons that open a menu and a dialog: put the trigger inside the tooltip. */
export const OnOverlayTriggers: Story = {
  render: ({ placement, caret }) => (
    <div className="flex gap-2 p-16" data-testid="overlay-triggers">
      <TooltipTrigger placement={placement}>
        <MenuTrigger>
          <IconButton variant="standard" icon={<MoreVertIcon />} aria-label="More" />
          <Menu aria-label="More">
            <MenuItem key="edit">Edit</MenuItem>
            <MenuItem key="share">Share</MenuItem>
          </Menu>
        </MenuTrigger>
        <Tooltip caret={caret}>More options</Tooltip>
      </TooltipTrigger>
      <TooltipTrigger placement={placement}>
        <DialogTrigger>
          <IconButton variant="standard" icon={<DeleteIcon />} aria-label="Delete" />
          <Dialog>
            {({ close }) => (
              <>
                <DialogTitle>Delete message?</DialogTitle>
                <DialogContent>It will be removed for everyone.</DialogContent>
                <DialogActions>
                  <Button variant="text" onPress={close}>
                    Cancel
                  </Button>
                  <Button variant="text" onPress={close}>
                    Delete
                  </Button>
                </DialogActions>
              </>
            )}
          </Dialog>
        </DialogTrigger>
        <Tooltip caret={caret}>Delete message</Tooltip>
      </TooltipTrigger>
    </div>
  ),
};

/** A persistent rich tooltip with a subhead and an action; press to open, Escape or outside to close. */
export const Rich: Story = {
  render: ({ placement, caret }) => (
    <div className="flex p-48" data-testid="rich">
      <RichTooltipTrigger persistent placement={placement}>
        <Button variant="tonal">What are grouped tabs?</Button>
        <RichTooltip
          caret={caret}
          title="Grouped tabs"
          action={<Button variant="text">Learn more</Button>}
        >
          Tabs from the same site stay together, so related pages are easy to find.
        </RichTooltip>
      </RichTooltipTrigger>
    </div>
  ),
};

/** A transient rich tooltip (the default): hover, focus or long-press; below and to the end. */
export const RichTransient: Story = {
  args: { placement: 'bottom start' },
  render: ({ placement, caret }) => (
    <div className="flex p-48" data-testid="rich-transient">
      <RichTooltipTrigger placement={placement}>
        <Button variant="tonal">Grouped tabs</Button>
        <RichTooltip caret={caret} title="Grouped tabs">
          Tabs from the same site stay together, so related pages are easy to find.
        </RichTooltip>
      </RichTooltipTrigger>
    </div>
  ),
};

/**
 * Anchors at the window's end edge: the tooltips keep their natural width and move inside
 * the 8px margin instead of being squeezed. Try it at phone width.
 */
export const AtTheEdge: Story = {
  render: () => (
    <div className="flex flex-col items-end gap-24 py-16" data-testid="edge">
      <TooltipTrigger placement="bottom">
        <IconButton variant="standard" icon={<SearchIcon />} aria-label="Search" tooltip={false} />
        <Tooltip>Search messages in all folders</Tooltip>
      </TooltipTrigger>
      <RichTooltipTrigger persistent>
        <Button variant="tonal">Tabs</Button>
        <RichTooltip title="Grouped tabs" action={<Button variant="text">Learn more</Button>}>
          Tabs from the same site stay together, so related pages are easy to find.
        </RichTooltip>
      </RichTooltipTrigger>
    </div>
  ),
};

/** In an app bar, icon buttons' tooltips open below them (M3). */
export const InAppBar: Story = {
  render: () => (
    <div className="w-[412px] pt-64" data-testid="app-bar">
      <TopAppBar
        title="Inbox"
        navigationIcon={<IconButton icon={<ArrowBackIcon />} aria-label="Back" />}
        actions={
          <>
            <IconButton icon={<StarIcon />} aria-label="Favourite" />
            <IconButton icon={<MoreVertIcon />} aria-label="More" />
          </>
        }
      />
    </div>
  ),
};

/** Open tooltips for visual regression. */
export const Open: Story = {
  render: () => (
    <div className="flex w-fit items-end gap-24 ps-16 pe-48 pt-40 pb-56" data-testid="open">
      <TooltipTrigger defaultOpen>
        <IconButton variant="standard" icon={<StarIcon />} aria-label="Favourite" />
        <Tooltip>Add to favourites</Tooltip>
      </TooltipTrigger>
      <TooltipTrigger defaultOpen placement="bottom">
        <IconButton variant="standard" icon={<EditIcon />} aria-label="Edit" />
        <Tooltip caret>Edit message</Tooltip>
      </TooltipTrigger>
      <RichTooltipTrigger defaultOpen>
        <Button variant="text">Info</Button>
        <RichTooltip>Synced just now</RichTooltip>
      </RichTooltipTrigger>
    </div>
  ),
};
