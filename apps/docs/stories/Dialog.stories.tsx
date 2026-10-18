import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Fab,
  Radio,
  RadioGroup,
  TextField,
} from '@windmorph/react';
import { useState } from 'react';
import { AddIcon, DeleteIcon } from './icons';
import {
  LAYOUT_OVERRIDE_NAMES,
  LAYOUT_OVERRIDES,
  type LayoutOverrideName,
} from './layout-overrides';

const meta = {
  title: 'Components/Dialog',
  component: Dialog,
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A basic dialog (an alert dialog on the web) with title, supporting text and two actions. */
export const Basic: Story = {
  render: () => (
    <DialogTrigger>
      <Button variant="tonal">Open dialog</Button>
      <Dialog data-testid="dialog">
        {({ close }) => (
          <>
            <DialogTitle>Discard draft?</DialogTitle>
            <DialogContent>Your changes to this message will be lost.</DialogContent>
            <DialogActions>
              <Button variant="text" onPress={close}>
                Cancel
              </Button>
              <Button variant="text" onPress={close}>
                Discard
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </DialogTrigger>
  ),
};

/** With an icon: the title is centred. */
export const WithIcon: Story = {
  render: () => (
    <DialogTrigger defaultOpen>
      <Button variant="tonal">Open dialog</Button>
      <Dialog icon={<DeleteIcon />} data-testid="dialog">
        {({ close }) => (
          <>
            <DialogTitle>Permanently delete?</DialogTitle>
            <DialogContent>
              Deleting the selected messages will also remove them from synced devices.
            </DialogContent>
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
  ),
};

/** Long content scrolls inside the dialog; long actions stack with the confirm action on top. */
export const LongContent: Story = {
  render: () => (
    <DialogTrigger defaultOpen>
      <Button variant="tonal">Open dialog</Button>
      <Dialog data-testid="dialog">
        {({ close }) => (
          <>
            <DialogTitle>Terms of service</DialogTitle>
            <DialogContent data-testid="content">
              {Array.from({ length: 40 }, (_, i) => (
                <p key={i} className="pb-2">
                  Paragraph {i + 1}. Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                </p>
              ))}
            </DialogContent>
            <DialogActions>
              <Button variant="text" onPress={close}>
                Decline and close this window
              </Button>
              <Button variant="text" onPress={close}>
                Accept all the terms above
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </DialogTrigger>
  ),
};

/** A plain `role="dialog"`, which pressing outside dismisses. */
export const Plain: Story = {
  render: () => (
    <DialogTrigger>
      <Button variant="tonal">Open dialog</Button>
      <Dialog role="dialog" data-testid="dialog">
        {({ close }) => (
          <>
            <DialogTitle>Keyboard shortcuts</DialogTitle>
            <DialogContent>Press F6 to reach a snackbar's actions.</DialogContent>
            <DialogActions>
              <Button variant="text" onPress={close}>
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </DialogTrigger>
  ),
};

/** Placed at the top of the window, 56px from its edge on wider windows. */
export const PlacementTop: Story = {
  render: () => (
    <DialogTrigger defaultOpen>
      <Button variant="tonal">Open dialog</Button>
      <Dialog placement="top" data-testid="dialog">
        {({ close }) => (
          <>
            <DialogTitle>Discard draft?</DialogTitle>
            <DialogContent>Your changes to this message will be lost.</DialogContent>
            <DialogActions>
              <Button variant="text" onPress={close}>
                Cancel
              </Button>
              <Button variant="text" onPress={close}>
                Discard
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </DialogTrigger>
  ),
};

/** An alert dialog is not dismissed by pressing outside. */
export const Alert: Story = {
  render: () => (
    <DialogTrigger>
      <Button>Reset settings</Button>
      <Dialog role="alertdialog" data-testid="dialog">
        {({ close }) => (
          <>
            <DialogTitle>Reset all settings?</DialogTitle>
            <DialogActions>
              <Button variant="text" onPress={close}>
                Cancel
              </Button>
              <Button variant="text" onPress={close}>
                Reset
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </DialogTrigger>
  ),
};

/** Full screen on compact windows, a basic dialog on larger ones. */
export const FullScreenCompact: Story = {
  render: () => (
    <DialogTrigger>
      <Button variant="tonal">Edit name</Button>
      <Dialog fullScreen="compact" data-testid="dialog">
        {({ close }) => (
          <>
            <DialogHeader
              action={
                <Button variant="text" onPress={close}>
                  Save
                </Button>
              }
            >
              Edit name
            </DialogHeader>
            <DialogContent data-testid="content">
              <TextField label="Name" defaultValue="Sam Taylor" className="w-full" />
            </DialogContent>
            <DialogActions>
              <Button variant="text" onPress={close}>
                Cancel
              </Button>
              <Button variant="text" onPress={close}>
                Save
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </DialogTrigger>
  ),
};

/** Always full screen. */
export const FullScreen: Story = {
  render: () => (
    <DialogTrigger>
      <Button variant="tonal">New event</Button>
      <Dialog fullScreen="always" data-testid="dialog">
        {({ close }) => (
          <>
            <DialogHeader
              action={
                <Button variant="text" onPress={close}>
                  Save
                </Button>
              }
            >
              New event
            </DialogHeader>
            <DialogContent>
              <TextField label="Title" className="w-full" />
            </DialogContent>
          </>
        )}
      </Dialog>
    </DialogTrigger>
  ),
};

/** Full screen without a header action: a divider under the header and a bottom action bar. */
export const FullScreenBottomBar: Story = {
  render: () => (
    <DialogTrigger>
      <Button variant="tonal">Filters</Button>
      <Dialog fullScreen="always" data-testid="dialog">
        {({ close }) => (
          <>
            <DialogHeader divider>Filters</DialogHeader>
            <DialogContent>
              <TextField label="Keyword" className="w-full" />
            </DialogContent>
            <DialogActions>
              <Button variant="text" onPress={close}>
                Clear
              </Button>
              <Button variant="text" onPress={close}>
                Apply
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </DialogTrigger>
  ),
};

/** A single action only acknowledges; short text still gets the 280px minimum width. */
export const Acknowledgement: Story = {
  render: () => (
    <DialogTrigger defaultOpen>
      <Button variant="tonal">Open dialog</Button>
      <Dialog data-testid="dialog">
        {({ close }) => (
          <>
            <DialogTitle>Saved</DialogTitle>
            <DialogContent>Done.</DialogContent>
            <DialogActions>
              <Button variant="text" onPress={close}>
                OK
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </DialogTrigger>
  ),
};

/** At the bottom of the window: it expands upward, away from the edge. */
export const PlacementBottom: Story = {
  render: () => (
    <DialogTrigger>
      <Button variant="tonal">Open dialog</Button>
      <Dialog placement="bottom" data-testid="dialog">
        {({ close }) => (
          <>
            <DialogTitle>Discard draft?</DialogTitle>
            <DialogContent>Your changes to this message will be lost.</DialogContent>
            <DialogActions>
              <Button variant="text" onPress={close}>
                Cancel
              </Button>
              <Button variant="text" onPress={close}>
                Discard
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </DialogTrigger>
  ),
};

/** Against the start edge: it slides and grows along the x axis, away from that edge. */
export const PlacementStart: Story = {
  render: () => (
    <DialogTrigger>
      <Button variant="tonal">Open dialog</Button>
      <Dialog placement="start" data-testid="dialog">
        {({ close }) => (
          <>
            <DialogTitle>Discard draft?</DialogTitle>
            <DialogContent>Your changes to this message will be lost.</DialogContent>
            <DialogActions>
              <Button variant="text" onPress={close}>
                Cancel
              </Button>
              <Button variant="text" onPress={close}>
                Discard
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </DialogTrigger>
  ),
};

/** Against the end edge: it slides and grows along the x axis, away from that edge. */
export const PlacementEnd: Story = {
  render: () => (
    <DialogTrigger>
      <Button variant="tonal">Open dialog</Button>
      <Dialog placement="end" data-testid="dialog">
        {({ close }) => (
          <>
            <DialogTitle>Discard draft?</DialogTitle>
            <DialogContent>Your changes to this message will be lost.</DialogContent>
            <DialogActions>
              <Button variant="text" onPress={close}>
                Cancel
              </Button>
              <Button variant="text" onPress={close}>
                Discard
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </DialogTrigger>
  ),
};

/**
 * Custom children take part in the motion: every child fades in with the content, and a
 * child marked `data-slot="actions"` fades in last, with the actions.
 */
export const CustomChildren: Story = {
  render: () => (
    <DialogTrigger>
      <Button variant="tonal">Open dialog</Button>
      <Dialog aria-labelledby="custom-title" data-testid="dialog">
        {({ close }) => (
          <>
            <h2 id="custom-title" className="pb-4 text-headline-small text-on-surface">
              Share with Priya?
            </h2>
            <p className="pb-6 text-body-medium text-on-surface-variant">
              She will be able to see and edit this album.
            </p>
            <div data-slot="actions" className="flex justify-end gap-2">
              <Button variant="text" onPress={close}>
                Cancel
              </Button>
              <Button variant="text" onPress={close}>
                Share
              </Button>
            </div>
          </>
        )}
      </Dialog>
    </DialogTrigger>
  ),
};

/** `transition="scale"`: the original pop, a fade with a scale from 90% (and to 95%). */
export const TransitionScale: Story = {
  render: () => (
    <DialogTrigger>
      <Button variant="tonal">Open dialog</Button>
      <Dialog transition="scale" data-testid="dialog">
        {({ close }) => (
          <>
            <DialogTitle>Discard draft?</DialogTitle>
            <DialogContent>Your changes to this message will be lost.</DialogContent>
            <DialogActions>
              <Button variant="text" onPress={close}>
                Cancel
              </Button>
              <Button variant="text" onPress={close}>
                Discard
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </DialogTrigger>
  ),
};

/** `instant`: no enter or exit motion. */
export const Instant: Story = {
  render: () => (
    <DialogTrigger>
      <Button variant="tonal">Open dialog</Button>
      <Dialog instant data-testid="dialog">
        {({ close }) => (
          <>
            <DialogTitle>Discard draft?</DialogTitle>
            <DialogContent>Your changes to this message will be lost.</DialogContent>
            <DialogActions>
              <Button variant="text" onPress={close}>
                Cancel
              </Button>
              <Button variant="text" onPress={close}>
                Discard
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </DialogTrigger>
  ),
};

/** `onOpened` and `onClosed` report when the enter and exit motion have finished. */
export const MotionCallbacks: Story = {
  render: function MotionCallbacksStory() {
    const [status, setStatus] = useState('Closed');
    return (
      <div className="flex flex-col items-start gap-4">
        <DialogTrigger onOpenChange={(open) => setStatus(open ? 'Opening' : 'Closing')}>
          <Button variant="tonal">Open dialog</Button>
          <Dialog
            data-testid="dialog"
            onOpened={() => setStatus('Opened')}
            onClosed={() => setStatus('Closed')}
          >
            {({ close }) => (
              <>
                <DialogTitle>Discard draft?</DialogTitle>
                <DialogContent>Your changes to this message will be lost.</DialogContent>
                <DialogActions>
                  <Button variant="text" onPress={close}>
                    Cancel
                  </Button>
                  <Button variant="text" onPress={close}>
                    Discard
                  </Button>
                </DialogActions>
              </>
            )}
          </Dialog>
        </DialogTrigger>
        <p className="text-body-medium text-on-surface" data-testid="status" aria-live="polite">
          {status}
        </p>
      </div>
    );
  },
};

/** Custom-positioned with `classNames.positioner`: the top end corner, within the 56px margin. */
export const CustomPosition: Story = {
  render: () => (
    <DialogTrigger>
      <Button variant="tonal">Open dialog</Button>
      <Dialog classNames={{ positioner: 'items-start justify-end' }} data-testid="dialog">
        {({ close }) => (
          <>
            <DialogTitle>Sync across devices?</DialogTitle>
            <DialogContent>
              Your theme and layout will match on every device where you sign in.
            </DialogContent>
            <DialogActions>
              <Button variant="text" onPress={close}>
                Not now
              </Button>
              <Button variant="text" onPress={close}>
                Sync
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </DialogTrigger>
  ),
};

/**
 * Layout safety (architecture §10) for `classNames.positioner`: a consumer layout class on
 * the positioner, opened from inside an optional transformed ancestor. The panel keeps its
 * size, corners, motion and focus ring, the scrim covers the window, and pressing outside
 * still dismisses this plain dialog.
 */
export const PositionerOverride: StoryObj<{
  override: LayoutOverrideName;
  transformedAncestor: boolean;
}> = {
  args: { override: 'none', transformedAncestor: false },
  argTypes: { override: { control: 'select', options: LAYOUT_OVERRIDE_NAMES } },
  render: ({ override, transformedAncestor }) => (
    <div className={transformedAncestor ? 'translate-x-2' : undefined}>
      <DialogTrigger>
        <Button variant="tonal">Open dialog</Button>
        <Dialog role="dialog" classNames={{ positioner: LAYOUT_OVERRIDES[override] }}>
          {({ close }) => (
            <>
              <DialogTitle>Sync across devices?</DialogTitle>
              <DialogContent>
                Your theme and layout will match on every device where you sign in.
              </DialogContent>
              <DialogActions>
                <Button variant="text" onPress={close}>
                  Not now
                </Button>
                <Button variant="text" onPress={close}>
                  Sync
                </Button>
              </DialogActions>
            </>
          )}
        </Dialog>
      </DialogTrigger>
    </div>
  ),
};

const RINGTONES = ['Callisto', 'Ganymede', 'Luna', 'Oberon', 'Phobos', 'Titania', 'Umbriel'];

function RingtoneDialog() {
  const [choice, setChoice] = useState('');
  return (
    <DialogTrigger defaultOpen>
      <Button variant="tonal">Ringtone</Button>
      <Dialog data-testid="dialog">
        {({ close }) => (
          <>
            <DialogTitle>Phone ringtone</DialogTitle>
            <DialogContent dividers data-testid="content">
              <RadioGroup aria-label="Ringtone" value={choice} onChange={setChoice}>
                {RINGTONES.map((name) => (
                  <Radio key={name} value={name}>
                    {name}
                  </Radio>
                ))}
              </RadioGroup>
            </DialogContent>
            <DialogActions>
              <Button variant="text" onPress={close}>
                Cancel
              </Button>
              <Button variant="text" disabled={choice === ''} onPress={close}>
                OK
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </DialogTrigger>
  );
}

/**
 * The optional dividers around a list, and the confirming action disabled until a choice is
 * made (the dismissive action never is).
 */
export const Dividers: Story = { render: () => <RingtoneDialog /> };

/** A FAB grows into a full-screen dialog (a container transform) on compact windows. */
export const ContainerTransform: Story = {
  render: () => (
    <DialogTrigger>
      <Fab
        icon={<AddIcon />}
        aria-label="New event"
        tooltip={false}
        className="fixed end-[16px] bottom-[16px]"
      />
      <Dialog fullScreen="compact" origin="trigger" data-testid="dialog">
        {({ close }) => (
          <>
            <DialogHeader
              action={
                <Button variant="text" onPress={close}>
                  Save
                </Button>
              }
            >
              New event
            </DialogHeader>
            <DialogContent>
              <TextField label="Title" className="w-full" />
            </DialogContent>
            <DialogActions>
              <Button variant="text" onPress={close}>
                Cancel
              </Button>
              <Button variant="text" onPress={close}>
                Save
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </DialogTrigger>
  ),
};

function EventEditor() {
  const [open, setOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [title, setTitle] = useState('');
  const [error, setError] = useState('');
  const finish = () => {
    setTitle('');
    setError('');
    setOpen(false);
  };
  const requestClose = (next: boolean) => {
    if (next) setOpen(true);
    else if (title !== '') setConfirming(true);
    else finish();
  };
  const save = () => {
    if (title.trim() === '') setError('Enter a title');
    else finish();
  };
  return (
    <>
      <DialogTrigger open={open} onOpenChange={requestClose}>
        <Button variant="tonal">New event</Button>
        <Dialog fullScreen="always" data-testid="dialog">
          <DialogHeader
            action={
              <Button variant="text" onPress={save}>
                Save
              </Button>
            }
          >
            New event
          </DialogHeader>
          <DialogContent>
            <TextField
              label="Title"
              value={title}
              onChange={(value) => {
                setTitle(value);
                setError('');
              }}
              invalid={error !== ''}
              errorMessage={error}
              className="w-full"
            />
          </DialogContent>
        </Dialog>
      </DialogTrigger>
      <Dialog open={confirming} onOpenChange={setConfirming}>
        <DialogTitle>Discard event?</DialogTitle>
        <DialogContent>The title you entered will be lost.</DialogContent>
        <DialogActions>
          <Button variant="text" onPress={() => setConfirming(false)}>
            Keep editing
          </Button>
          <Button
            variant="text"
            onPress={() => {
              setConfirming(false);
              finish();
            }}
          >
            Discard
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

/**
 * Closing a full-screen dialog with unsaved changes asks to discard them in a basic dialog;
 * Save reports a missing title inline.
 */
export const DiscardConfirmation: Story = { render: () => <EventEditor /> };

/**
 * Layout safety (architecture §10): a consumer layout class on the trigger (`part:
 * trigger`) or on the dialog (`className`, which goes on its outermost element; `part:
 * panel`), inside an optional transformed ancestor. The trigger keeps
 * its size, corners, state layer and focus ring; the dialog still opens in the window,
 * keeps its width and corners, and moves and returns focus.
 */
export const LayoutOverride: StoryObj<{
  override: LayoutOverrideName;
  transformedAncestor: boolean;
  part: 'trigger' | 'panel';
}> = {
  args: { override: 'none', transformedAncestor: false, part: 'trigger' },
  argTypes: {
    override: { control: 'select', options: LAYOUT_OVERRIDE_NAMES },
    part: { control: 'inline-radio', options: ['trigger', 'panel'] },
  },
  render: ({ override, transformedAncestor, part }) => {
    const layout = LAYOUT_OVERRIDES[override];
    return (
      <div className={transformedAncestor ? 'translate-x-2' : undefined} style={{ minHeight: 200 }}>
        <DialogTrigger>
          <Button data-testid="target" className={part === 'trigger' ? layout : undefined}>
            Open dialog
          </Button>
          <Dialog role="dialog" className={part === 'panel' ? layout : undefined}>
            {({ close }) => (
              <>
                <DialogTitle>Sync across devices?</DialogTitle>
                <DialogContent>
                  Your theme and layout will match on every device where you sign in.
                </DialogContent>
                <DialogActions>
                  <Button variant="text" onPress={close}>
                    Not now
                  </Button>
                  <Button variant="text" onPress={close}>
                    Sync
                  </Button>
                </DialogActions>
              </>
            )}
          </Dialog>
        </DialogTrigger>
      </div>
    );
  },
};
