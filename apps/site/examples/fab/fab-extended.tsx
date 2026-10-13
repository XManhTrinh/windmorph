import { ExtendedFab } from '@windmorph/react';
import { EditIcon } from '../../components/icons';

/**
 * The extended FAB shows a label beside the icon. The label names the FAB, so a text-only
 * extended FAB needs no `aria-label`. Sizes are `sm` / `md` / `lg`.
 */
export function FabExtended() {
  return (
    <>
      <ExtendedFab size="sm" icon={<EditIcon />}>
        Compose
      </ExtendedFab>
      <ExtendedFab size="md" color="secondary-container" icon={<EditIcon />}>
        Compose
      </ExtendedFab>
      <ExtendedFab size="lg" color="tertiary-container">
        Text only
      </ExtendedFab>
    </>
  );
}
