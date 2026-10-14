'use client';

import { IconButton } from '@windmorph/react';
import { useState } from 'react';
import { AddIcon, CloseIcon } from '../../components/icons';

/**
 * With `iconTransition="rotate"` the icon turns and crossfades into `selectedIcon`, as in
 * Google's Expressive showcase. It's an extension beyond the M3 spec, which swaps the icon.
 * Reduced motion keeps only the crossfade.
 */
export function IconButtonRotate() {
  const [open, setOpen] = useState(false);
  return (
    <IconButton
      toggle
      variant="tonal"
      size="md"
      shape="square"
      selected={open}
      onSelectedChange={setOpen}
      icon={<AddIcon />}
      selectedIcon={<CloseIcon />}
      iconTransition="rotate"
      aria-label="Add"
    />
  );
}
