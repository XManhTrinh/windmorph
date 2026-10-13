'use client';

import { IconButton, List, ListItem } from '@windmorph/react';
import { ListDetailLayout } from '@windmorph/react-pro';
import { useState } from 'react';
import { ArrowBackIcon } from '../../components/icons';

const SECTIONS = [
  { key: 'profile', title: 'Profile', summary: 'Name, photos, bio and languages' },
  { key: 'account', title: 'Account', summary: 'Username, email and password' },
  { key: 'preferences', title: 'Preferences', summary: 'Language and theme' },
  { key: 'privacy', title: 'Privacy', summary: 'Search engines and blocked accounts' },
];

/**
 * Settings. In an app the list items are links (`href`) and `active` comes from the route;
 * here state stands in for the router. Narrow the window below 840px to see one pane at a
 * time, with Back.
 */
export function ListDetailSettings() {
  const [open, setOpen] = useState('profile');
  const [active, setActive] = useState<'list' | 'detail'>('list');
  const section = SECTIONS.find((item) => item.key === open) ?? SECTIONS[0];

  return (
    <ListDetailLayout
      className="min-h-80 w-full"
      active={active}
      detailKey={`${active}-${open}`}
      listLabel="Settings"
      detailLabel={section?.title ?? ''}
      back={
        <IconButton
          variant="standard"
          aria-label="Back to settings"
          icon={<ArrowBackIcon />}
          onPress={() => setActive('list')}
        />
      }
      list={
        <List
          aria-label="Settings sections"
          selectionMode="single"
          selectedKeys={[open]}
          onSelectionChange={(keys) => {
            const [key] = keys === 'all' ? [] : [...keys];
            setOpen(key === undefined ? open : String(key));
            setActive('detail');
          }}
        >
          {SECTIONS.map((item) => (
            <ListItem key={item.key} supportingText={item.summary}>
              {item.title}
            </ListItem>
          ))}
        </List>
      }
      detail={
        <div className="flex flex-col gap-2 p-4">
          <h3 className="text-headline-small text-on-surface">{section?.title}</h3>
          <p className="text-body-large text-on-surface-variant">{section?.summary}</p>
        </div>
      }
    />
  );
}
