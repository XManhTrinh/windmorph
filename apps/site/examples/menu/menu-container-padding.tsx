'use client';

import { IconButton, Menu, MenuItem, MenuTrigger } from '@windmorph/react';
import { MoreVertIcon } from '../../components/icons';

const PADDINGS = [
  { padding: 12, label: 'More options (12px from the edge)' },
  { padding: 32, label: 'More options (32px from the edge)' },
] as const;

/**
 * `containerPadding` is the least space a menu keeps from the window's edges: 12px by
 * default. A menu opened from a trigger at the edge of a narrow window slides in by that much,
 * so raise it to clear a rounded screen corner or a floating frame, or pass 0 to line a menu
 * up with a trigger that sits flush with the edge, as a split button does.
 */
export function MenuContainerPadding() {
  return (
    <div className="flex w-full justify-between gap-3">
      {PADDINGS.map(({ padding, label }) => (
        <MenuTrigger key={padding}>
          <IconButton variant="tonal" icon={<MoreVertIcon />} aria-label={label} />
          <Menu placement="bottom end" containerPadding={padding}>
            <MenuItem key="rename">Rename</MenuItem>
            <MenuItem key="duplicate">Duplicate</MenuItem>
            <MenuItem key="move">Move to another folder</MenuItem>
          </Menu>
        </MenuTrigger>
      ))}
    </div>
  );
}
