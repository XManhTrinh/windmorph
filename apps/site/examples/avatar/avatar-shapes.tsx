import { Avatar, avatarShapes } from '@windmorph/react-pro';

/**
 * `shape` takes `circle`, `rounded` or any of the 35 M3 Expressive shapes. Expressive
 * shapes are masks, so they scale with the avatar. The default is `circle`.
 */
export function AvatarShapes() {
  return (
    <ul className="grid w-full grid-cols-3 gap-4 medium:grid-cols-6 expanded:grid-cols-8">
      {avatarShapes.map((shape) => (
        <li key={shape} className="flex flex-col items-center gap-2">
          <Avatar name="Priya Shah" decorative size="lg" shape={shape} tone="primary" />
          <code className="text-label-small text-on-surface-variant">{shape}</code>
        </li>
      ))}
    </ul>
  );
}
