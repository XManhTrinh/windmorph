'use client';

import { IconButton } from '@windmorph/react';
import { useState } from 'react';
import { StarIcon, StarOutlineIcon } from '../../components/icons';

/**
 * A toggle icon button can swap to a `selectedIcon` when selected — here the outline star
 * fills in. The `aria-label` names it in both states.
 */
export function IconButtonToggle() {
  const [favourite, setFavourite] = useState(false);
  return (
    <IconButton
      toggle
      variant="filled"
      size="md"
      selected={favourite}
      onSelectedChange={setFavourite}
      icon={<StarOutlineIcon />}
      selectedIcon={<StarIcon />}
      aria-label="Favourite"
    />
  );
}
