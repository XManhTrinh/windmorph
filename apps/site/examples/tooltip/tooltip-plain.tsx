'use client';

import { IconButton, Tooltip, TooltipTrigger } from '@windmorph/react';
import { EditIcon, SearchIcon, StarIcon } from '../../components/icons';

const ITEMS = [
  { icon: <StarIcon />, label: 'Favourite', tip: 'Add to favourites' },
  { icon: <EditIcon />, label: 'Edit', tip: 'Edit message' },
  { icon: <SearchIcon />, label: 'Search', tip: 'Search all folders' },
];

/**
 * Plain tooltips label their trigger on hover or keyboard focus (they describe it via
 * `aria-describedby`). Hover or focus an icon button to show one; it stays while the
 * pointer is over it and Escape hides it. `caret` draws a small pointer at the anchor.
 */
export function TooltipPlain() {
  return (
    <div className="flex gap-2">
      {ITEMS.map(({ icon, label, tip }) => (
        <TooltipTrigger key={label}>
          <IconButton variant="standard" icon={icon} aria-label={label} />
          <Tooltip caret>{tip}</Tooltip>
        </TooltipTrigger>
      ))}
    </div>
  );
}
