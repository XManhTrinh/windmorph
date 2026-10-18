'use client';

import { Avatar, AvatarGroup } from '@windmorph/react-pro';

const MEMBERS = [
  { id: 'nora', name: 'Nora Lindqvist' },
  { id: 'omar', name: 'Omar Haddad' },
  { id: 'priya', name: 'Priya Shah' },
];

/** An app's own component around an Avatar: the group still finds it, through context. */
function MemberAvatar({ id, name }: { id: string; name: string }) {
  return <Avatar name={name} alt={name} href={`#demo-member-${id}`} />;
}

/**
 * Linked avatars in an app's wrapper component. Each takes the group's size, and with two or
 * more links the group spaces itself (48px minus the avatar's size) so their 48px touch
 * targets never overlap.
 */
export function AvatarGroupLinks() {
  return (
    <AvatarGroup aria-label="Organisers" size="sm">
      {MEMBERS.map((member) => (
        <MemberAvatar key={member.id} {...member} />
      ))}
    </AvatarGroup>
  );
}
