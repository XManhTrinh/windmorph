'use client';

import { Button, Menu, MenuGroup, MenuItem, MenuTrigger } from '@windmorph/react';
import { DeleteIcon, EditIcon, SendIcon, StarIcon } from '../../components/icons';

const LAYOUTS = [
  { layout: 'divider', label: 'With dividers' },
  { layout: 'gap', label: 'With gaps' },
] as const;

/**
 * The two ways a vertical menu groups its items: `layout="divider"` keeps one surface with a
 * divider between groups (M3's choice on the web and for menus that scroll), and
 * `layout="gap"` gives each group its own surface, 2px apart. Both work in the standard
 * and vibrant colours.
 */
export function MenuLayouts() {
  return (
    <div className="flex flex-wrap gap-3">
      {LAYOUTS.map(({ layout, label }) => (
        <MenuTrigger key={layout}>
          <Button variant="tonal">{label}</Button>
          <Menu layout={layout}>
            <MenuGroup aria-label="Edit">
              <MenuItem key="edit" leadingIcon={<EditIcon />}>
                Edit
              </MenuItem>
              <MenuItem key="share" leadingIcon={<SendIcon />}>
                Share
              </MenuItem>
            </MenuGroup>
            <MenuGroup aria-label="Organise">
              <MenuItem key="favourite" leadingIcon={<StarIcon />}>
                Add to favourites
              </MenuItem>
            </MenuGroup>
            <MenuGroup aria-label="Danger zone">
              <MenuItem key="delete" leadingIcon={<DeleteIcon />}>
                Delete
              </MenuItem>
            </MenuGroup>
          </Menu>
        </MenuTrigger>
      ))}
    </div>
  );
}
