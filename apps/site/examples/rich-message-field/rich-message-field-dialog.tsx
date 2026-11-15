'use client';

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  DialogTrigger,
  IconButton,
} from '@windmorph/react';
import { useMessageField } from '@windmorph/react-pro';
import { RichMessageField } from '@windmorph/react-pro/rich-text';
import { useState, type CSSProperties } from 'react';

/**
 * A dialog's corners are extra-large (28px), which is a grown field's default too. Inside
 * the dialog the field takes a smaller corner than its container's, so it reads as a rounded
 * rectangle in the dialog, not a second bubble.
 */
const IN_A_DIALOG = {
  '--wm-message-field-grown-corner': 'var(--md-sys-shape-corner-large)',
} as CSSProperties;

/** Material Symbols `mood`. */
const MOOD = (
  <svg viewBox="0 -960 960 960" fill="currentColor">
    <path d="M620-520q25 0 42.5-17.5T680-580q0-25-17.5-42.5T620-640q-25 0-42.5 17.5T560-580q0 25 17.5 42.5T620-520Zm-280 0q25 0 42.5-17.5T400-580q0-25-17.5-42.5T340-640q-25 0-42.5 17.5T280-580q0 25 17.5 42.5T340-520Zm140 260q68 0 123.5-38.5T684-400H276q25 63 80.5 101.5T480-260Zm0 180q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-400Zm0 320q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Z" />
  </svg>
);

/** A tool on the row below the text: puts 🙂 at the caret. */
function EmojiTool() {
  const field = useMessageField();
  return (
    <IconButton
      variant="standard"
      icon={MOOD}
      aria-label="Add 🙂"
      onPress={() => field.insertText('🙂')}
    />
  );
}

/**
 * A post's composer in a dialog: the formatting toolbar above the text, a row of tools below
 * it, and the dialog's own actions in place of Send. The grown field's corner is set smaller
 * than the dialog's (`--wm-message-field-grown-corner`). It is a form, so the dialog is a
 * `dialog`, not an alert, and a press outside doesn't close it: only Cancel, Post or Escape
 * do. The draft is kept above the dialog, so it is still there after Cancel or Escape, and
 * posting clears it.
 */
export function RichMessageFieldDialog() {
  const [text, setText] = useState('');
  const post = (close: () => void) => {
    setText('');
    close();
  };
  return (
    <DialogTrigger>
      <Button variant="tonal">New post</Button>
      <Dialog role="dialog" closedBy="closerequest">
        {({ close }) => (
          <>
            <DialogTitle>New post</DialogTitle>
            <DialogContent>
              <RichMessageField
                aria-label="What’s on your mind?"
                placeholder="What’s on your mind?"
                variant="outlined"
                formatting="always"
                formattingPlacement="top"
                tools={<EmojiTool />}
                submitOn="mod-enter"
                send={false}
                minRows={4}
                autoFocus
                value={text}
                onChange={setText}
                onSubmit={() => post(close)}
                style={IN_A_DIALOG}
              />
            </DialogContent>
            <DialogActions>
              <Button variant="text" onPress={close}>
                Cancel
              </Button>
              <Button variant="text" disabled={text.trim() === ''} onPress={() => post(close)}>
                Post
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </DialogTrigger>
  );
}
