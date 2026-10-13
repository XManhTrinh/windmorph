import { Fab } from '@windmorph/react';
import { EditIcon } from '../../components/icons';

/**
 * The three sizes (default 56px, medium 80px, large 96px) and a few colour styles. FABs
 * have no disabled state, so none is shown. Each needs an `aria-label`.
 */
export function FabColors() {
  return (
    <>
      <Fab size="default" icon={<EditIcon />} aria-label="Compose" />
      <Fab size="medium" color="secondary-container" icon={<EditIcon />} aria-label="Compose" />
      <Fab size="large" color="tertiary-container" icon={<EditIcon />} aria-label="Compose" />
      <Fab color="primary" elevation="lowered" icon={<EditIcon />} aria-label="Compose lowered" />
    </>
  );
}
