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
 * `role="alertdialog"` is for a decision the user must make: it is not dismissed by
 * pressing outside (Escape still closes it unless `keyboardDismissDisabled`). An `icon`
 * centres the title.
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
