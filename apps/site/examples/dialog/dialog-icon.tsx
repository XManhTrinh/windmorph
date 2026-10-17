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
 * The optional hero icon sits above the headline, which is then centred (the spec's
 * anatomy). The icon is decorative; the title still names the dialog. Keep it for dialogs
 * whose icon adds meaning, such as a destructive confirmation.
 */
export function DialogIcon() {
  return (
    <DialogTrigger>
      <Button variant="tonal">Delete account</Button>
      <Dialog icon={<DeleteIcon />}>
        {({ close }) => (
          <>
            <DialogTitle>Delete your account?</DialogTitle>
            <DialogContent>
              Your profile, posts and messages will be removed. This can&apos;t be undone.
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
  );
}
