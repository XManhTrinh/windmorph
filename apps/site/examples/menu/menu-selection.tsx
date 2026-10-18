'use client';

import { Button, Menu, MenuItem, MenuTrigger } from '@windmorph/react';
import { useState } from 'react';

/**
 * Single selection with the `vibrant` variant (tertiary-container). The selected item
 * takes the selected shape and a check expands in beside it. Selection is controlled with
 * `selectedKeys` / `onSelectionChange`.
 */
export function MenuSelection() {
  const [sort, setSort] = useState(new Set(['name']));
  return (
    <MenuTrigger>
      <Button variant="tonal">Sort by {[...sort][0]}</Button>
      <Menu
        variant="vibrant"
        aria-label="Sort by"
        selectionMode="single"
        deselectable={false}
        selectedKeys={sort}
        onSelectionChange={(keys) => setSort(new Set([...(keys as Set<string>)]))}
      >
        <MenuItem key="name">name</MenuItem>
        <MenuItem key="date">date modified</MenuItem>
        <MenuItem key="size">size</MenuItem>
      </Menu>
    </MenuTrigger>
  );
}
