import { Avatar } from '@windmorph/react-pro';

const NAMES = [
  'Alex Morgan',
  'Priya Shah',
  'Omar Haddad',
  'Zoë Müller',
  'Sam Taylor',
  'Hannah Kim',
];
const TONES = ['primary', 'secondary', 'tertiary', 'neutral'] as const;

/**
 * `tone="auto"` (the default) gives each name its own colour, the same every time. A fixed
 * tone uses one of the theme's container roles instead.
 */
export function AvatarTones() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-3">
        {NAMES.map((name) => (
          <Avatar key={name} name={name} alt={name} />
        ))}
      </div>
      <div className="flex flex-wrap gap-3">
        {TONES.map((tone) => (
          <Avatar key={tone} name="Priya Shah" alt={`Priya Shah, ${tone}`} tone={tone} />
        ))}
      </div>
    </div>
  );
}
