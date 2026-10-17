'use client';

import { Menu, MenuItem, SplitButton } from '@windmorph/react';
import { EditIcon } from '../../components/icons';

const editMenu = (
  <Menu>
    <MenuItem key="duplicate">Duplicate</MenuItem>
    <MenuItem key="rename">Rename</MenuItem>
  </Menu>
);

/** The four styles. There is no text split button; sizes run `xs`–`xl` like Button. */
export function SplitButtonVariants() {
  return (
    <>
      <SplitButton
        variant="filled"
        leadingIcon={<EditIcon />}
        menuLabel="More filled options"
        menu={editMenu}
      >
        Filled
      </SplitButton>
      <SplitButton
        variant="tonal"
        leadingIcon={<EditIcon />}
        menuLabel="More tonal options"
        menu={editMenu}
      >
        Tonal
      </SplitButton>
      <SplitButton
        variant="outlined"
        leadingIcon={<EditIcon />}
        menuLabel="More outlined options"
        menu={editMenu}
      >
        Outlined
      </SplitButton>
      <SplitButton
        variant="elevated"
        leadingIcon={<EditIcon />}
        menuLabel="More elevated options"
        menu={editMenu}
      >
        Elevated
      </SplitButton>
    </>
  );
}
