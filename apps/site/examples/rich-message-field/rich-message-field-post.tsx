'use client';

import { Button } from '@windmorph/react';
import { RichMessageField } from '@windmorph/react-pro/rich-text';
import { useState } from 'react';

/**
 * A post's composer: longer writing, so Enter is a new line and Ctrl or ⌘+Enter posts, the
 * formatting toolbar always shows above the text, and the form's own Post button posts
 * instead of Send.
 */
export function RichMessageFieldPost() {
  const [text, setText] = useState('');
  const [posted, setPosted] = useState(false);

  return (
    <form
      className="flex w-full max-w-lg flex-col gap-3"
      onSubmit={(event) => {
        event.preventDefault();
        setPosted(true);
      }}
    >
      <RichMessageField
        label="What’s on your mind?"
        variant="outlined"
        formatting="always"
        formattingPlacement="top"
        submitOn="mod-enter"
        send={false}
        minRows={4}
        maxLength={2000}
        value={text}
        onChange={(value) => {
          setText(value);
          setPosted(false);
        }}
        onSubmit={() => setPosted(true)}
      />
      <div className="flex items-center justify-end gap-3">
        <span role="status" className="text-body-medium text-on-surface-variant">
          {posted ? 'Posted.' : ''}
        </span>
        <Button type="submit" disabled={text.trim() === ''}>
          Post
        </Button>
      </div>
    </form>
  );
}
