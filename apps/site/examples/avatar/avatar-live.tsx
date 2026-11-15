import { Avatar } from '@windmorph/react-pro';
import type { CSSProperties } from 'react';

/** On air now: the ring and the pill in the error role, which follows every theme. */
const LIVE = {
  '--wm-avatar-status-ring-active': 'var(--md-sys-color-error)',
  '--wm-avatar-badge': 'var(--md-sys-color-error)',
  '--wm-avatar-on-badge': 'var(--md-sys-color-on-error)',
} as CSSProperties;

const CHANNELS = [
  { id: 'harbour-fm', name: 'Harbour FM', live: true },
  { id: 'daily-bake', name: 'Daily Bake', live: true },
  { id: 'trail-notes', name: 'Trail Notes', live: false },
  { id: 'studio-nine', name: 'Studio Nine', live: false },
];

/**
 * Channels, the ones broadcasting now first: a ring and a "LIVE" pill on the bottom edge,
 * both in the error role. A channel that isn't live passes `undefined` and `false`, so it
 * draws neither and its name leaves them out. The pill hangs below the avatar, so the names
 * sit a little further down.
 */
export function AvatarLive() {
  return (
    <ul aria-label="Channels" className="flex gap-4 overflow-x-auto p-3" style={LIVE}>
      {CHANNELS.map((channel) => (
        <li key={channel.id} className="flex w-20 shrink-0 flex-col items-center gap-4">
          <Avatar
            name={channel.name}
            alt={channel.name}
            href={`#demo-channel-${channel.id}`}
            size="xl"
            statusRing={channel.live ? 'active' : undefined}
            statusRingLabel="broadcasting now"
            badge={channel.live && 'LIVE'}
            badgeLabel="live"
            badgePlacement="bottom"
          />
          <span
            aria-hidden="true"
            className="w-full truncate text-center text-label-medium text-on-surface"
          >
            {channel.name}
          </span>
        </li>
      ))}
    </ul>
  );
}
