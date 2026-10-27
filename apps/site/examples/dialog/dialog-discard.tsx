'use client';

import { useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  TextField,
} from '@windmorph/react';

/**
 * Closing a full-screen dialog with unsaved changes asks, in a basic dialog, whether to
 * discard them. The dialog is controlled: its close button, Escape and a press outside all
 * call `onOpenChange(false)`, which opens the confirmation instead while there are
 * changes. Save reports a field's error inline, where it occurs, rather than in another
 * dialog.
 */
export function DialogDiscard() {
  const [open, setOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [title, setTitle] = useState('');
  const [error, setError] = useState('');

  const finish = () => {
    setTitle('');
    setError('');
    setOpen(false);
  };
  const requestOpenChange = (next: boolean) => {
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
      <DialogTrigger open={open} onOpenChange={requestOpenChange}>
        <Button variant="tonal">New event</Button>
        <Dialog fullScreen="compact">
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
          <DialogActions>
            <Button variant="text" onPress={() => requestOpenChange(false)}>
              Cancel
            </Button>
            <Button variant="text" onPress={save}>
              Save
            </Button>
          </DialogActions>
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
