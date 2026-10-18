'use client';

import { IconButton } from '@windmorph/react';
import { Avatar, MessageField, useMessageField } from '@windmorph/react-pro';
import { useState } from 'react';

/** Material Symbols `mood`. */
const MOOD = (
  <svg viewBox="0 -960 960 960" fill="currentColor">
    <path d="M620-520q25 0 42.5-17.5T680-580q0-25-17.5-42.5T620-640q-25 0-42.5 17.5T560-580q0 25 17.5 42.5T620-520Zm-280 0q25 0 42.5-17.5T400-580q0-25-17.5-42.5T340-640q-25 0-42.5 17.5T280-580q0 25 17.5 42.5T340-520Zm140 260q68 0 123.5-38.5T684-400H276q25 63 80.5 101.5T480-260Zm0 180q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-400Zm0 320q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Z" />
  </svg>
);

/** A tool: its own button and action. This one puts 🙂 at the caret. */
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
 * A comment field under a post: a pill with its tools at the end, which opens on first focus
 * into the text and a row of tools with Send. Enter posts, Shift+Enter starts a new line.
 */
export function MessageFieldComment() {
  const [comments, setComments] = useState(['Count me in! I’ll bring spring rolls.']);
  const [sending, setSending] = useState(false);

  // Stands in for the app's request; the field clears itself once the comment is posted.
  const post = (text: string) => {
    setSending(true);
    setTimeout(() => {
      setComments((current) => [...current, text]);
      setSending(false);
    }, 600);
  };

  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      <ul className="flex flex-col gap-2" aria-label="Comments">
        {comments.map((comment, index) => (
          <li
            key={index}
            className="rounded-corner-large bg-surface-container px-4 py-2 text-body-medium whitespace-pre-line text-on-surface"
          >
            {comment}
          </li>
        ))}
      </ul>
      <MessageField
        aria-label="Write a comment"
        placeholder="Write a comment…"
        leading={<Avatar name="Alex Morgan" decorative size="md" />}
        expandOnFocus
        tools={<EmojiTool />}
        sendVariant="standard"
        maxLength={500}
        pending={sending}
        clearOnSubmit
        onSubmit={post}
      />
    </div>
  );
}
