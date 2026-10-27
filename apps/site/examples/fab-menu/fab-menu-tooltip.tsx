'use client';

import { FabMenu, FabMenuItem } from '@windmorph/react';
import { AddIcon, CloseIcon, EditIcon, SendIcon } from '../../components/icons';

/**
 * While closed, the FAB menu's button shows its `aria-label` in a tooltip on hover and
 * keyboard focus (open, it is the close button and has none). Here the label is already
 * visible beside the button, so `tooltip={false}` turns the tooltip off.
 */
export function FabMenuTooltip() {
  return (
    <div className="relative h-[320px] w-full max-w-[400px] rounded-corner-large bg-surface-container-low">
      <span
        aria-hidden="true"
        className="absolute end-[88px] bottom-[34px] text-label-large text-on-surface-variant"
      >
        New post
      </span>
      <FabMenu
        icon={<AddIcon />}
        openIcon={<CloseIcon />}
        aria-label="New post"
        tooltip={false}
        className="absolute end-4 bottom-4"
      >
        <FabMenuItem icon={<EditIcon />}>Draft</FabMenuItem>
        <FabMenuItem icon={<SendIcon />}>Publish now</FabMenuItem>
      </FabMenu>
    </div>
  );
}
