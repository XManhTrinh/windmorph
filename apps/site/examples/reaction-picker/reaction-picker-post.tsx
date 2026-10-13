'use client';

import { ReactionPicker, type ReactionOption } from '@windmorph/react-pro';
import { useState } from 'react';

/** Material Symbols `thumb_up` (outlined): the button's icon before anyone reacts. */
function ThumbUpIcon() {
  return (
    <svg viewBox="0 -960 960 960" fill="currentColor">
      <path d="M720-120H280v-520l280-280 50 50q7 7 11.5 19t4.5 23v14l-44 174h258q32 0 56 24t24 56v80q0 7-2 15t-4 15L794-168q-9 20-30 34t-44 14Zm-360-80h360l120-280v-80H480l54-220-174 174v406Zm0-406v406-406Zm-80-34v80H160v360h120v80H80v-520h200Z" />
    </svg>
  );
}

/** The app's reactions: the component knows none of them. */
const REACTIONS: ReactionOption[] = [
  { id: 'like', label: 'Like', icon: '👍', outlineIcon: <ThumbUpIcon />, color: 'primary' },
  { id: 'love', label: 'Love', icon: '❤️', color: 'error' },
  { id: 'care', label: 'Care', icon: '🥰', color: 'warning' },
  { id: 'haha', label: 'Haha', icon: '😆', color: 'warning' },
  { id: 'wow', label: 'Wow', icon: '😮', color: 'warning' },
  { id: 'sad', label: 'Sad', icon: '😢', color: 'warning' },
  { id: 'angry', label: 'Angry', icon: '😡', color: 'error' },
];

/** A post's action bar: tap to like, hold or rest the mouse for the other reactions. */
export function ReactionPickerPost() {
  const [reaction, setReaction] = useState<string | null>(null);
  const others = 12;
  const total = others + (reaction ? 1 : 0);
  return (
    <div className="flex w-full max-w-md flex-col gap-2 pt-16">
      <p className="text-body-medium text-on-surface-variant" aria-live="polite">
        {reaction ? `You and ${others} others reacted` : `${total} people reacted`}
      </p>
      <div className="flex items-center border-t border-outline-variant pt-1">
        <ReactionPicker options={REACTIONS} value={reaction} onChange={setReaction} />
      </div>
    </div>
  );
}
