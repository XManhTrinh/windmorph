'use client';

import { IconButton, Menu, MenuItem, MenuTrigger } from '@windmorph/react';
import { ReorderList, ReorderListItem, useReorderListItem } from '@windmorph/react-pro';
import { useState } from 'react';
import { MoreVertIcon } from '../../components/icons';

const LINKS = [
  { id: 'site', title: 'Portfolio', address: 'alexmorgan.example' },
  { id: 'shop', title: 'Shop', address: 'shop.alexmorgan.example' },
  { id: 'blog', title: 'Notes', address: 'notes.alexmorgan.example' },
  { id: 'contact', title: 'Contact', address: 'alexmorgan.example/contact' },
];

/** A row's own menu: the same moves through `useReorderListItem()`, with its own items. */
function RowMenu({ title }: { title: string }) {
  const { moveUp, moveDown, canMoveUp, canMoveDown } = useReorderListItem();
  return (
    <MenuTrigger>
      <IconButton variant="standard" icon={<MoreVertIcon />} aria-label={`More for ${title}`} />
      <Menu
        disabledKeys={[...(canMoveUp ? [] : ['up']), ...(canMoveDown ? [] : ['down'])]}
        onAction={(key) => {
          if (key === 'up') moveUp();
          if (key === 'down') moveDown();
        }}
      >
        <MenuItem key="up">Move up</MenuItem>
        <MenuItem key="down">Move down</MenuItem>
        <MenuItem key="edit">Edit link</MenuItem>
      </Menu>
    </MenuTrigger>
  );
}

/**
 * With a menu of its own on each row, `moveMenu={false}` turns the handle's menu off and the
 * row's menu moves it through `useReorderListItem()`; focus stays on the row's menu button.
 * Contact is `reorderable={false}`: it has no handle, and no other row passes it. The
 * handle sits at the end with `handlePlacement="end"`.
 */
export function ReorderListOwnMenu() {
  const [order, setOrder] = useState(LINKS.map((link) => link.id));
  return (
    <ReorderList
      aria-label="Profile links"
      className="w-full max-w-md"
      moveMenu={false}
      handlePlacement="end"
      onReorder={(keys) => setOrder(keys as string[])}
    >
      {order.map((id) => {
        const link = LINKS.find((item) => item.id === id)!;
        return (
          <ReorderListItem key={id} textValue={link.title} reorderable={id !== 'contact'}>
            <div className="flex items-center gap-2">
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="text-body-large text-on-surface">{link.title}</span>
                <span className="truncate text-body-medium text-on-surface-variant">
                  {link.address}
                </span>
              </div>
              <RowMenu title={link.title} />
            </div>
          </ReorderListItem>
        );
      })}
    </ReorderList>
  );
}
