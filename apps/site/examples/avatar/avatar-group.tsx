'use client';

import { Avatar, AvatarGroup } from '@windmorph/react-pro';
import { useState } from 'react';

const PEOPLE = [
  'Nora Lindqvist',
  'Omar Haddad',
  'Priya Shah',
  'Yuki Tanaka',
  'Mateo Alvarez',
  'Hannah Kim',
];

/**
 * Avatars overlap with a surface ring, and `max` turns the rest into "+N". The group is
 * named once by `label`; here "+N" is a button that would open the full list.
 */
export function AvatarGroupExample() {
  const [opened, setOpened] = useState(0);
  return (
    <div className="flex flex-col items-start gap-3">
      <AvatarGroup
        label="Nora Lindqvist, Omar Haddad and 4 others"
        max={3}
        onOverflowPress={() => setOpened((count) => count + 1)}
      >
        {PEOPLE.map((name) => (
          <Avatar key={name} name={name} decorative />
        ))}
      </AvatarGroup>
      <p className="text-body-medium text-on-surface-variant">Opened the list {opened} times</p>
    </div>
  );
}
