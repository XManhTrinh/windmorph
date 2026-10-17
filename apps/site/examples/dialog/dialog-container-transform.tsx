'use client';

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogHeader,
  DialogTrigger,
  Fab,
  TextField,
} from '@windmorph/react';
import { AddIcon } from '../../components/icons';

/**
 * A FAB that grows into a full-screen dialog, the spec's container transform:
 * `origin="trigger"` starts the dialog on the FAB's box, corners and colour, opens it to
 * the window on the slow spatial spring and shrinks it back into the FAB on close. It
 * applies while the dialog is full screen (below 600px with `fullScreen="compact"`);
 * reduced motion keeps only the fade. Narrow the window to see it.
 */
export function DialogContainerTransform() {
  return (
    <DialogTrigger>
      <Fab icon={<AddIcon />} aria-label="New event" />
      <Dialog fullScreen="compact" origin="trigger">
        {({ close }) => (
          <>
            <DialogHeader
              closeLabel="Close"
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
  );
}
