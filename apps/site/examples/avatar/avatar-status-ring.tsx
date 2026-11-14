'use client';

import { Avatar } from '@windmorph/react-pro';
import { useState, type CSSProperties } from 'react';

/** A gradient for the ring: its paint token takes any `background`. */
const GRADIENT = {
  '--wm-avatar-status-ring-active':
    'conic-gradient(from 210deg, var(--md-sys-color-primary), var(--md-sys-color-tertiary), var(--md-sys-color-primary))',
} as CSSProperties;

/** Something under way now: the ring and the pill in the error role. */
const LIVE = {
  '--wm-avatar-status-ring-active': 'var(--md-sys-color-error)',
  '--wm-avatar-badge': 'var(--md-sys-color-error)',
  '--wm-avatar-on-badge': 'var(--md-sys-color-on-error)',
} as CSSProperties;

/**
 * A status ring says there is something to see about an account: `active` for something new,
 * `inactive` once it has been seen, with its meaning in `statusRingLabel`. Segments count the
 * things to see, a token takes a gradient, and a pill at the bottom holds a short word. The
 * ring is drawn outside the avatar, so the row leaves room round each one.
 */
export function AvatarStatusRing() {
  const [seen, setSeen] = useState(false);
  return (
    <div className="flex flex-wrap items-center gap-6 p-2 pb-4">
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
        name="Priya Shah"
        alt="Priya Shah"
        size="lg"
        statusRing="active"
        statusRingLabel="new story"
        style={GRADIENT}
      />
      <Avatar
        name="Yuki Tanaka"
        alt="Yuki Tanaka"
        size="lg"
        statusRing="active"
        statusRingLabel="broadcasting now"
        badge="LIVE"
        badgePlacement="bottom"
        badgeLabel="live"
        style={LIVE}
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
