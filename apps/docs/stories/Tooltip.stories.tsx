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
  type TooltipPlacement,
} from '@windmorph/react';
import { DeleteIcon, EditIcon, MoreVertIcon, SearchIcon, StarIcon } from './icons';

interface Args {
  placement: TooltipPlacement;
  caret: boolean;
}

const meta = {
  title: 'Components/Tooltip',
  args: { placement: 'top', caret: false },
  argTypes: { placement: { control: 'inline-radio', options: ['top', 'bottom', 'left', 'right'] } },
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
          <IconButton icon={icon} aria-label={label} />
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
          <IconButton icon={<MoreVertIcon />} aria-label="More" />
          <Menu aria-label="More">
            <MenuItem key="edit">Edit</MenuItem>
            <MenuItem key="share">Share</MenuItem>
          </Menu>
        </MenuTrigger>
        <Tooltip caret={caret}>More options</Tooltip>
      </TooltipTrigger>
      <TooltipTrigger placement={placement}>
        <DialogTrigger>
          <IconButton icon={<DeleteIcon />} aria-label="Delete" />
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

/** A rich tooltip with a subhead and an action; press to open, Escape or outside to close. */
export const Rich: Story = {
  render: ({ placement, caret }) => (
    <div className="flex p-48" data-testid="rich">
      <RichTooltipTrigger placement={placement}>
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

/** Open tooltips for visual regression. */
export const Open: Story = {
  render: () => (
    <div className="flex w-fit items-end gap-24 px-16 pt-40 pb-56" data-testid="open">
      <TooltipTrigger defaultOpen>
        <IconButton icon={<StarIcon />} aria-label="Favourite" />
        <Tooltip>Add to favourites</Tooltip>
      </TooltipTrigger>
      <TooltipTrigger defaultOpen placement="bottom">
        <IconButton icon={<EditIcon />} aria-label="Edit" />
        <Tooltip caret>Edit message</Tooltip>
      </TooltipTrigger>
    </div>
  ),
};
