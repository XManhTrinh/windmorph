import { Fab } from '@windmorph/react';
import { EditIcon } from '../../components/icons';

/**
 * Elevation: `default` (level 3) floats over content, `lowered` (level 1) sits closer to it,
 * and `flat` (level 0) is for a FAB nested in another component, such as a navigation rail.
 */
export function FabElevation() {
  return (
    <div className="flex flex-wrap items-center gap-6">
      <Fab icon={<EditIcon />} aria-label="Compose (default elevation)" />
      <Fab elevation="lowered" icon={<EditIcon />} aria-label="Compose (lowered)" />
      <div className="rounded-corner-large bg-surface-container p-3">
        <Fab elevation="flat" icon={<EditIcon />} aria-label="Compose (flat)" />
      </div>
    </div>
  );
}
