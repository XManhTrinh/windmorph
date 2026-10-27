import { Button, ButtonGroup, IconButton } from '@windmorph/react';
import { AddIcon, StarIcon } from '../../components/icons';

/**
 * A standard group spaces its buttons 12px apart and shares `size` through context. Press
 * a button: it grows while its neighbours shrink, keeping the group's width.
 */
export function ButtonGroupStandard() {
  return (
    <ButtonGroup size="sm" aria-label="Document actions">
      <Button leadingIcon={<AddIcon />}>Create</Button>
      <Button variant="tonal">Share</Button>
      <Button variant="outlined">Archive</Button>
      <IconButton variant="tonal" icon={<StarIcon />} aria-label="Favourite" />
    </ButtonGroup>
  );
}
