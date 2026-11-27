'use client';

import { EmojiPickerTrigger } from '@windmorph/react-pro/emoji-picker';
import { useState } from 'react';

/**
 * The trigger outside a field, for a one-off pick: a popover from the medium window size, a
 * bottom sheet on a phone. `closeOnSelect` closes it on the first pick, and focus goes back to
 * the button.
 */
export function EmojiPickerStatus() {
  const [status, setStatus] = useState('🌴');
  return (
    <div className="flex items-center gap-2">
      <EmojiPickerTrigger
        aria-label="Choose a status emoji"
        storageKey="docs-emoji-picker"
        closeOnSelect
        onEmojiSelect={({ emoji }) => setStatus(emoji)}
      />
      <p className="text-body-large text-on-surface">
        Status: <span className="text-title-large">{status}</span> Out of office
      </p>
    </div>
  );
}
