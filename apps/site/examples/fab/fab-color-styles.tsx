import { Fab } from '@windmorph/react';
import { EditIcon } from '../../components/icons';

const COLORS = [
  'primary-container',
  'secondary-container',
  'tertiary-container',
  'primary',
  'secondary',
  'tertiary',
] as const;

/**
 * The six colour styles: the container roles (primary container is the default) and the
 * vibrant primary, secondary and tertiary roles added in M3 Expressive.
 */
export function FabColorStyles() {
  return (
    <div className="flex flex-wrap items-center gap-4">
      {COLORS.map((color) => (
        <Fab key={color} color={color} icon={<EditIcon />} aria-label={`Compose (${color})`} />
      ))}
    </div>
  );
}
