'use client';

import {
  EmojiPickerTrigger,
  type CustomEmoji,
  type EmojiSelection,
} from '@windmorph/react-pro/emoji-picker';
import { useState } from 'react';

/** A Material Symbols path, drawn at the emoji size in one of the theme's colours. */
const symbol = (d: string, color: string) => () => (
  <svg viewBox="0 -960 960 960" className={`size-full ${color}`} fill="currentColor" aria-hidden>
    <path d={d} />
  </svg>
);

/**
 * The app's own emoji: an image (`src`, with `animatedSrc` played only while hovered or
 * focused), or anything `render` draws, as here.
 */
const TEAM_EMOJI: CustomEmoji[] = [
  {
    id: 'gold-star',
    label: 'Gold star',
    tags: ['favourite', 'best', 'well done'],
    render: symbol(
      'm233-120 65-281L80-590l288-25 112-265 112 265 288 25-218 189 65 281-247-149-247 149Z',
      'text-tertiary',
    ),
  },
  {
    id: 'team-heart',
    label: 'Team heart',
    tags: ['love', 'thanks'],
    render: symbol(
      'm480-120-58-52q-101-91-167-157T150-447.5Q111-500 95.5-544T80-634q0-94 63-157t157-63q52 0 99 22t81 62q34-40 81-62t99-22q94 0 157 63t63 157q0 46-15.5 90T810-447.5Q771-395 705-329T538-172l-58 52Z',
      'text-error',
    ),
  },
  {
    id: 'shipped',
    label: 'Shipped',
    tags: ['done', 'released', 'tick'],
    render: symbol(
      'm424-296 282-282-56-56-226 226-114-114-56 56 170 170Zm56 216q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Z',
      'text-primary',
    ),
  },
];

/**
 * Custom emoji sit in a Custom category after Recently used, and search finds them by name and
 * tags. A text box can't hold an image, so a pick hands text for it (`:gold-star:` by default,
 * or what `customText` returns) with the emoji itself in `custom`; the app draws its image
 * wherever it shows that text.
 */
export function EmojiPickerCustom() {
  const [picked, setPicked] = useState<EmojiSelection | null>(null);
  return (
    <div className="flex items-center gap-2">
      <EmojiPickerTrigger
        aria-label="Choose a team emoji"
        storageKey={null}
        custom={TEAM_EMOJI}
        customText={(emoji) => `:team-${emoji.id}:`}
        onEmojiSelect={setPicked}
      />
      <p className="text-body-large text-on-surface">
        {picked ? `${picked.label}: ${picked.emoji}` : 'Nothing picked yet'}
      </p>
    </div>
  );
}
