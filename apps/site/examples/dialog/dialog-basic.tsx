'use client';

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '@windmorph/react';

/**
 * A basic dialog opened from a `DialogTrigger`: the first child is the trigger, the rest
 * is the `Dialog`. The flat parts `DialogTitle`, `DialogContent` and `DialogActions` set
 * its anatomy; the title also names the dialog. Children may be `({ close }) => …` so the
 * actions can close it. Escape also closes it; a press outside doesn't (it is an alert dialog).
 */
export function DialogBasic() {
  return (
    <DialogTrigger>
      <Button variant="tonal">Open dialog</Button>
      <Dialog>
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
  );
}
