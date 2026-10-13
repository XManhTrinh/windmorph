'use client';

import { ReactionPicker, type ReactionOption } from '@windmorph/react-pro';
import { useState } from 'react';

/** Fewer reactions for messages, with the labels from the app's French translations. */
const REACTIONS: ReactionOption[] = [
  { id: 'love', label: 'J’adore', icon: '❤️', color: 'error' },
  { id: 'haha', label: 'Haha', icon: '😆', color: 'warning' },
  { id: 'wow', label: 'Wow', icon: '😮', color: 'warning' },
  { id: 'sad', label: 'Triste', icon: '😢', color: 'warning' },
];

/** The small size under a message: a tap loves it, a long press picks something else. */
export function ReactionPickerMessage() {
  const [reaction, setReaction] = useState<string | null>('haha');
  return (
    <div className="flex flex-col items-start gap-1 pt-16">
      <p className="rounded-corner-large bg-secondary-container px-4 py-2 text-body-large text-on-secondary-container">
        Phở tomorrow, anyone in?
      </p>
      <ReactionPicker
        size="sm"
        options={REACTIONS}
        value={reaction}
        onChange={setReaction}
        labels={{
          openPicker: 'Appui long pour choisir une autre réaction',
          reactions: 'Réactions',
        }}
      />
    </div>
  );
}
