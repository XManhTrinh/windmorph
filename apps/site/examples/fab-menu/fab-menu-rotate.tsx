'use client';

import { FabMenu, FabMenuItem } from '@windmorph/react';
import { AddIcon, CloseIcon, EditIcon, SendIcon } from '../../components/icons';

/**
 * `iconTransition="rotate"` turns the outgoing icon 90° as it fades and turns the incoming
 * one in, as in Google's Expressive showcase (the spec swaps them halfway through the morph).
 * `elevation="lowered"` sets the button and its items one level down.
 */
export function FabMenuRotate() {
  return (
    <div className="relative h-[320px] w-full max-w-[400px] rounded-corner-large bg-surface-container-low">
      <FabMenu
        icon={<AddIcon />}
        openIcon={<CloseIcon />}
        iconTransition="rotate"
        elevation="lowered"
        aria-label="Share"
        className="absolute end-4 bottom-4"
      >
        <FabMenuItem icon={<EditIcon />}>Write a note</FabMenuItem>
        <FabMenuItem icon={<SendIcon />}>Send a link</FabMenuItem>
      </FabMenu>
    </div>
  );
}
