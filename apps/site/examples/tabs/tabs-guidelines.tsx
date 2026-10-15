'use client';

import { Tab, Tabs } from '@windmorph/react';
import { EditIcon, SendIcon, StarIcon } from '../../components/icons';

/** Do: every tab has an icon and a label. */
export function TabsDoConsistent() {
  return (
    <Tabs aria-label="Inbox" className="w-full max-w-96">
      <Tab key="all" title="All" icon={<StarIcon />} />
      <Tab key="sent" title="Sent" icon={<SendIcon />} />
      <Tab key="drafts" title="Drafts" icon={<EditIcon />} />
    </Tabs>
  );
}

/** Don't: icons on some tabs but not on others. */
export function TabsDontMixed() {
  return (
    <Tabs aria-label="Inbox" className="w-full max-w-96">
      <Tab key="all" title="All" icon={<StarIcon />} />
      <Tab key="sent" title="Sent" />
      <Tab key="drafts" title="Drafts" icon={<EditIcon />} />
    </Tabs>
  );
}
