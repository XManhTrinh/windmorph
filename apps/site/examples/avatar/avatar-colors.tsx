import { Avatar } from '@windmorph/react-pro';

const NAMES = [
  'Alex Morgan',
  'Priya Shah',
  'Omar Haddad',
  'Zoë Müller',
  'Sam Taylor',
  'Hannah Kim',
];
const COLORS = ['primary', 'secondary', 'tertiary', 'neutral'] as const;

/**
 * `color="auto"` (the default) gives each name its own colour, the same every time. A fixed
 * colour uses one of the theme's container roles instead.
 */
export function AvatarColors() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-3">
        {NAMES.map((name) => (
          <Avatar key={name} name={name} alt={name} />
        ))}
      </div>
      <div className="flex flex-wrap gap-3">
        {COLORS.map((color) => (
          <Avatar key={color} name="Priya Shah" alt={`Priya Shah, ${color}`} color={color} />
        ))}
      </div>
    </div>
  );
}
