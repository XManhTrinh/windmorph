import { Avatar, type AvatarProps } from '@windmorph/react-pro';
import type { CSSProperties } from 'react';
import { PORTRAITS } from './sample-portraits';

/** Another gradient of an app's own, set once on the row for every avatar in it. */
const RING = {
  '--wm-avatar-status-ring-active': 'linear-gradient(135deg, #6ee7a8, #4f9df7 50%, #8b5cf6)',
} as CSSProperties;

const PEOPLE: { name: string; photo: string; size: NonNullable<AvatarProps['size']> }[] = [
  { name: 'Nora Lindqvist', photo: PORTRAITS.nora, size: '2xl' },
  { name: 'Yuki Tanaka', photo: PORTRAITS.yuki, size: 'xl' },
  { name: 'Omar Haddad', photo: PORTRAITS.omar, size: 'lg' },
  { name: 'Priya Shah', photo: PORTRAITS.priya, size: 'md' },
  { name: 'Mateo Alvarez', photo: PORTRAITS.mateo, size: 'sm' },
  { name: 'Sam Taylor', photo: PORTRAITS.sam, size: 'xs' },
];

/**
 * The ring at every size, from 96px down to 24px: 3px wide from `lg` up and 2px below, always
 * a small gap away from the photo. It is drawn outside the avatar's box, so the row leaves
 * room round each one.
 */
export function AvatarRingSizes() {
  return (
    <div className="flex flex-wrap items-center gap-6 p-2" style={RING}>
      {PEOPLE.map(({ name, photo, size }) => (
        <Avatar
          key={name}
          name={name}
          src={photo}
          alt={name}
          size={size}
          statusRing="active"
          statusRingLabel="new post"
        />
      ))}
    </div>
  );
}
