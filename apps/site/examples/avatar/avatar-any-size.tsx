import { Avatar, AvatarGroup } from '@windmorph/react-pro';
import { PORTRAITS } from './sample-portraits';

/**
 * Any size in px with a number, for a slot the named sizes don't fit: the corners, initials
 * and rings follow the nearest named size (48px is `lg`). A group of 36px links spaces them
 * so their 48px touch targets never meet.
 */
export function AvatarAnySize() {
  return (
    <div className="flex flex-col gap-6 p-2">
      <div className="flex flex-wrap items-end gap-4">
        <Avatar name="Nora Lindqvist" alt="Nora Lindqvist" size={28} />
        <Avatar name="Omar Haddad" alt="Omar Haddad" src={PORTRAITS.omar} size={48} />
        <Avatar name="Priya Shah" alt="Priya Shah" size={64} presence="online" />
      </div>
      <AvatarGroup aria-label="Organisers" size={36}>
        <Avatar name="Sam Taylor" alt="Sam Taylor's profile" href="#demo-sam" />
        <Avatar name="Yuki Tanaka" alt="Yuki Tanaka's profile" href="#demo-yuki" />
        <Avatar name="Mateo Alvarez" alt="Mateo Alvarez's profile" href="#demo-mateo" />
      </AvatarGroup>
    </div>
  );
}
