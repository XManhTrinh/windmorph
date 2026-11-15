'use client';

import { Avatar } from '@windmorph/react-pro';
import { useState } from 'react';

/**
 * A status ring says there is something to see about an account: `active` for something new,
 * `inactive` once it has been seen (press the first one), with its meaning in
 * `statusRingLabel`. Segments count the things to see, the seen ones first. The ring is drawn
 * outside the avatar, so the row leaves room round each one.
 */
export function AvatarStatusRing() {
  const [seen, setSeen] = useState(false);
  return (
    <div className="flex flex-wrap items-center gap-6 p-2">
      <Avatar
        name="Nora Lindqvist"
        alt="Nora Lindqvist"
        size="lg"
        statusRing={seen ? 'inactive' : 'active'}
        statusRingLabel={seen ? 'story seen' : 'new story'}
        onPress={() => setSeen((value) => !value)}
      />
      <Avatar
        name="Omar Haddad"
        alt="Omar Haddad"
        size="lg"
        statusRing="active"
        statusRingSegments={5}
        statusRingInactiveSegments={2}
        statusRingLabel="3 new stories"
      />
      <Avatar
        name="Mateo Alvarez"
        alt="Mateo Alvarez"
        size="lg"
        statusRing="inactive"
        statusRingLabel="nothing new"
      />
    </div>
  );
}
