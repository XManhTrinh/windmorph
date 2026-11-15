'use client';

import { Avatar } from '@windmorph/react-pro';
import { useState, type CSSProperties } from 'react';
import { PORTRAITS } from './sample-portraits';

/**
 * An app's own gradient for the ring: the paint token takes any `background`. Set on the row,
 * it reaches every avatar in it. These are fixed colours, the same in every theme.
 */
const STORY_RING = {
  '--wm-avatar-status-ring-active':
    'linear-gradient(45deg, #f5a524, #f0503c 35%, #c9289e 65%, #6b3fd4)',
} as CSSProperties;

/** Material Symbols `add`. */
const AddIcon = () => (
  <svg viewBox="0 -960 960 960" fill="currentColor" aria-hidden="true">
    <path d="M440-440H200v-80h240v-240h80v240h240v80H520v240h-80v-240Z" />
  </svg>
);

const PEOPLE = [
  { name: 'Nora Lindqvist', photo: PORTRAITS.nora },
  { name: 'Omar Haddad', photo: PORTRAITS.omar },
  { name: 'Priya Shah', photo: PORTRAITS.priya },
  { name: 'Mateo Alvarez', photo: PORTRAITS.mateo },
];

const item = 'flex w-20 shrink-0 flex-col items-center gap-3';
const caption = 'w-full truncate text-center text-label-medium text-on-surface';

/**
 * A row of stories: a gradient ring round each account with something new, and the quiet
 * inactive ring once it has been seen (press one). The first avatar adds a story of your own,
 * with a badge in its corner. Each avatar's name says it all ("Nora Lindqvist, new story"),
 * so the names written below are for the eye only.
 */
export function AvatarStories() {
  const [seen, setSeen] = useState<readonly string[]>(['Mateo Alvarez']);
  const toggle = (name: string) =>
    setSeen((names) =>
      names.includes(name) ? names.filter((other) => other !== name) : [...names, name],
    );
  return (
    <ul aria-label="Stories" className="flex gap-4 overflow-x-auto p-3" style={STORY_RING}>
      <li className={item}>
        <Avatar
          name="Sam Taylor"
          src={PORTRAITS.sam}
          alt="Your story"
          href="#demo-new-story"
          size="xl"
          badge={<AddIcon />}
          badgeLabel="add a story"
          badgePlacement="bottom-end"
        />
        <span aria-hidden="true" className={caption}>
          Your story
        </span>
      </li>
      {PEOPLE.map(({ name, photo }) => (
        <li key={name} className={item}>
          <Avatar
            name={name}
            src={photo}
            alt={name}
            size="xl"
            statusRing={seen.includes(name) ? 'inactive' : 'active'}
            statusRingLabel={seen.includes(name) ? 'story seen' : 'new story'}
            onPress={() => toggle(name)}
          />
          <span aria-hidden="true" className={caption}>
            {name.split(' ')[0]}
          </span>
        </li>
      ))}
    </ul>
  );
}
