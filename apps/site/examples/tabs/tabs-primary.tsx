'use client';

import { Tab, Tabs } from '@windmorph/react';
import { EditIcon, SendIcon, StarIcon } from '../../components/icons';

/**
 * Primary tabs with an icon above each label and a panel per tab. The indicator is
 * content-width and slides to the selection; arrow keys move between tabs and Home / End
 * jump to the ends. `Tab`s are identified by their React `key`.
 */
export function TabsPrimary() {
  return (
    <div className="w-full max-w-[480px]">
      <Tabs aria-label="Inbox">
        <Tab key="all" title="All" icon={<StarIcon />}>
          <p className="p-4 text-body-large text-on-surface-variant">Everything in one place.</p>
        </Tab>
        <Tab key="sent" title="Sent" icon={<SendIcon />}>
          <p className="p-4 text-body-large text-on-surface-variant">Messages you sent.</p>
        </Tab>
        <Tab key="drafts" title="Drafts" icon={<EditIcon />}>
          <p className="p-4 text-body-large text-on-surface-variant">Unfinished messages.</p>
        </Tab>
      </Tabs>
    </div>
  );
}
