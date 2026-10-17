'use client';

import { DockedToolbar, IconButton, Menu, MenuItem, MenuTrigger } from '@windmorph/react';
import {
  ContentCopyIcon,
  DeleteIcon,
  EditIcon,
  MoreVertIcon,
  SearchIcon,
  SendIcon,
  ShareIcon,
  StarIcon,
} from '../../components/icons';

/**
 * In a compact window a docked toolbar keeps a few actions, evenly spaced
 * (`arrangement="space-between"`), and moves the rest into an overflow menu at the end.
 * The overflow is an ordinary `MenuTrigger` with an icon button; show more actions directly
 * in larger windows.
 */
export function ToolbarDockedOverflow() {
  return (
    <div className="w-[360px] max-w-full">
      <DockedToolbar aria-label="Message actions" arrangement="space-between">
        <IconButton icon={<SearchIcon />} aria-label="Search" />
        <IconButton icon={<StarIcon />} aria-label="Star" />
        <IconButton icon={<SendIcon />} aria-label="Send" />
        <IconButton variant="filled" icon={<EditIcon />} aria-label="Compose" />
        <MenuTrigger>
          <IconButton icon={<MoreVertIcon />} aria-label="More actions" />
          <Menu aria-label="More actions" placement="top end">
            <MenuItem key="copy" leadingIcon={<ContentCopyIcon />}>
              Copy
            </MenuItem>
            <MenuItem key="share" leadingIcon={<ShareIcon />}>
              Share
            </MenuItem>
            <MenuItem key="delete" leadingIcon={<DeleteIcon />}>
              Delete
            </MenuItem>
          </Menu>
        </MenuTrigger>
      </DockedToolbar>
    </div>
  );
}
