'use client';

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '@windmorph/react';
import { DeleteIcon } from '../../components/icons';

/**
 * A basic dialog is an alert dialog (`role="alertdialog"`, the default) for a decision the
 * user must make: it is not dismissed by pressing outside (its `closedBy` is `"closerequest"`,
 * so Escape still closes it). An `icon` centres the title.
 */
export function DialogAlert() {
  return (
    <DialogTrigger>
      <Button>Reset settings</Button>
      <Dialog role="alertdialog" icon={<DeleteIcon />}>
        {({ close }) => (
          <>
            <DialogTitle>Reset all settings?</DialogTitle>
            <DialogContent>
              This returns every setting to its default. You can&apos;t undo it.
            </DialogContent>
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
  );
}
