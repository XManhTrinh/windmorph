'use client';

import { FloatingToolbar, IconButton } from '@windmorph/react';
import { useState } from 'react';
import {
  DeleteIcon,
  EditIcon,
  FormatBoldIcon,
  FormatItalicIcon,
  FormatUnderlinedIcon,
} from '../../components/icons';

const formatting = (
  <>
    <IconButton toggle icon={<FormatBoldIcon />} aria-label="Bold" />
    <IconButton toggle icon={<FormatItalicIcon />} aria-label="Italic" />
    <IconButton toggle icon={<FormatUnderlinedIcon />} aria-label="Underline" />
  </>
);

/**
 * A floating toolbar is a pill of controls that floats above the content, in standard or
 * vibrant colours. Its `leading` and `trailing` groups collapse when `expanded` is false;
 * keyboard focus inside expands it so every control stays reachable. Toggle the button to
 * watch the collapse.
 */
export function ToolbarFloating() {
  const [expanded, setExpanded] = useState(true);
  return (
    <div className="flex flex-col items-start gap-4">
      <button
        type="button"
        className="text-label-large text-primary underline"
        onClick={() => setExpanded((value) => !value)}
      >
        {expanded ? 'Collapse' : 'Expand'}
      </button>
      <div className="flex items-start gap-6">
        <FloatingToolbar
          aria-label="Formatting"
          expanded={expanded}
          leading={<IconButton icon={<EditIcon />} aria-label="Edit" />}
          trailing={<IconButton icon={<DeleteIcon />} aria-label="Delete" />}
        >
          {formatting}
        </FloatingToolbar>
        <FloatingToolbar
          aria-label="Formatting (vibrant)"
          color="vibrant"
          expanded={expanded}
          leading={<IconButton icon={<EditIcon />} aria-label="Edit" />}
          trailing={<IconButton icon={<DeleteIcon />} aria-label="Delete" />}
        >
          {formatting}
        </FloatingToolbar>
      </div>
    </div>
  );
}
