'use client';

import { Button } from '@windmorph/react';
import { useState } from 'react';
import { StarIcon, StarOutlineIcon } from '../../components/icons';

/**
 * A toggle button holds a selected state (`aria-pressed`). Selected round buttons become
 * square and change colour; pass `selected` + `onSelectedChange` to control it. The icon
 * swaps from outlined to filled through `selectedLeadingIcon`.
 */
export function ButtonToggle() {
  const [starred, setStarred] = useState(false);
  return (
    <Button
      toggle
      size="md"
      selected={starred}
      onSelectedChange={setStarred}
      leadingIcon={<StarOutlineIcon />}
      selectedLeadingIcon={<StarIcon />}
    >
      {starred ? 'Starred' : 'Star'}
    </Button>
  );
}
