'use client';

import { EmojiPicker, type EmojiSelection } from '@windmorph/react-pro/emoji-picker';
import { useState } from 'react';

/**
 * The panel on its own, placed by the app: here, beside what it sets. A pick hands the emoji,
 * its name and its hexcode in the chosen skin tone, and the panel stays open for more. Recently
 * used emoji and the tone are kept on this device under `storageKey`.
 */
export function EmojiPickerPanel() {
  const [picked, setPicked] = useState<EmojiSelection | null>(null);
  return (
    <div className="flex w-full min-w-0 flex-wrap items-start gap-6">
      <EmojiPicker storageKey="docs-emoji-picker" onEmojiSelect={setPicked} />
      <p className="text-body-large text-on-surface" aria-live="polite">
        {picked ? `${picked.emoji} ${picked.label}` : 'Nothing picked yet'}
      </p>
    </div>
  );
}
