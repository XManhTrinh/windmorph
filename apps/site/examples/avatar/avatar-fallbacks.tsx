import { Avatar } from '@windmorph/react-pro';

/**
 * Without a photo, an avatar shows initials from `name` in a stable container tone, or an
 * icon when there is no name (a person by default, or your own with `icon`). Sizes run from
 * 24px to 96px.
 */
export function AvatarFallbacks() {
  return (
    <div className="flex flex-wrap items-end gap-4">
      <Avatar name="Nora Lindqvist" alt="Nora Lindqvist" size="xs" />
      <Avatar name="Omar Haddad" alt="Omar Haddad" size="sm" />
      <Avatar name="Priya Shah" alt="Priya Shah" />
      <Avatar name="Mateo Alvarez" alt="Mateo Alvarez" size="lg" />
      <Avatar alt="No name" size="lg" />
      <Avatar alt="No name" size="lg" shape="rounded" />
    </div>
  );
}
