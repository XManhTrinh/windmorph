'use client';

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '@windmorph/react';
import { Avatar, MessageField, MessageFieldTrigger } from '@windmorph/react-pro';

/** Material Symbols `image`. */
function PhotoIcon() {
  return (
    <svg viewBox="0 -960 960 960" fill="currentColor">
      <path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm0-80h560v-560H200v560Zm40-80h480L570-480 450-320l-90-120-120 160Zm-40 80v-560 560Z" />
    </svg>
  );
}

/** "What's on your mind?" on the home feed, opening the post composer. */
export function MessageFieldTriggerExample() {
  return (
    <div className="w-full max-w-md">
      <DialogTrigger>
        <MessageFieldTrigger
          leading={<Avatar name="Alex Morgan" decorative size="md" />}
          trailing={<PhotoIcon />}
        >
          What&apos;s on your mind?
        </MessageFieldTrigger>
        <Dialog aria-label="Create post">
          {({ close }) => (
            <>
              <DialogTitle>Create post</DialogTitle>
              <DialogContent>
                <MessageField
                  aria-label="What's on your mind?"
                  placeholder="What's on your mind?"
                  variant="outlined"
                  minRows={4}
                  send={false}
                  autoFocus
                />
              </DialogContent>
              <DialogActions>
                <Button variant="text" onPress={close}>
                  Cancel
                </Button>
                <Button onPress={close}>Post</Button>
              </DialogActions>
            </>
          )}
        </Dialog>
      </DialogTrigger>
    </div>
  );
}
