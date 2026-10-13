import { Button } from '@windmorph/react';
import { EditIcon } from '../../components/icons';

/**
 * Round (the default) and square buttons. Both press to the same squarer corners; a selected
 * square toggle turns round, the opposite of a round one.
 */
export function ButtonShapes() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button size="md" leadingIcon={<EditIcon />}>
        Round
      </Button>
      <Button size="md" shape="square" leadingIcon={<EditIcon />}>
        Square
      </Button>
      <Button toggle size="md" shape="square" variant="tonal" leadingIcon={<EditIcon />}>
        Square toggle
      </Button>
    </div>
  );
}
