'use client';

import { MessageField } from '@windmorph/react-pro';
import { EmojiPickerTrigger } from '@windmorph/react-pro/emoji-picker';
import { useState } from 'react';

/**
 * The trigger in a message field's tools: each pick goes in at the caret, and the picker stays
 * open for more. From the medium window size it opens in a popover; on a phone it docks below
 * the field in the keyboard's place, and its button becomes a keyboard button.
 */
export function EmojiPickerMessageField() {
  const [text, setText] = useState('');
  const [sent, setSent] = useState<string[]>([]);

  const send = (message: string) => {
    setSent((current) => [...current, message]);
    setText('');
  };

  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      <ol className="flex flex-col items-end gap-2" aria-label="Sent messages">
        {sent.map((message, index) => (
          <li
            key={index}
            className="rounded-corner-large bg-primary px-4 py-2 text-body-medium whitespace-pre-line text-on-primary"
          >
            {message}
          </li>
        ))}
      </ol>
      <MessageField
        aria-label="Message"
        placeholder="Message"
        value={text}
        onChange={setText}
        onSubmit={send}
        tools={<EmojiPickerTrigger storageKey="docs-emoji-picker" />}
      />
    </div>
  );
}
