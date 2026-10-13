'use client';

import { FloatingToolbar, IconButton, ToolbarFab } from '@windmorph/react';
import {
  DeleteIcon,
  EditIcon,
  FormatBoldIcon,
  FormatItalicIcon,
  FormatUnderlinedIcon,
  ShareIcon,
} from '../../components/icons';

/**
 * Vertical floating toolbars, for medium and larger windows, where they sit 24px from the
 * window's start or end edge. One is standard and one vibrant (`primary-container`); the
 * second carries a `ToolbarFab`, which sits below the toolbar (`fabPosition="bottom"`).
 * Arrow keys move up and down between the controls.
 */
export function ToolbarVertical() {
  return (
    <div className="flex items-start gap-10">
      <FloatingToolbar aria-label="Formatting" orientation="vertical">
        <IconButton toggle icon={<FormatBoldIcon />} aria-label="Bold" />
        <IconButton toggle icon={<FormatItalicIcon />} aria-label="Italic" />
        <IconButton toggle icon={<FormatUnderlinedIcon />} aria-label="Underline" />
      </FloatingToolbar>
      <FloatingToolbar
        aria-label="Photo actions"
        orientation="vertical"
        color="vibrant"
        fabPosition="bottom"
        fab={<ToolbarFab icon={<EditIcon />} aria-label="Edit photo" />}
      >
        <IconButton icon={<ShareIcon />} aria-label="Share" />
        <IconButton icon={<DeleteIcon />} aria-label="Delete" />
      </FloatingToolbar>
    </div>
  );
}
