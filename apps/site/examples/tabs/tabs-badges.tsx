'use client';

import { Badge, Tab, Tabs } from '@windmorph/react';
import { EditIcon, SendIcon, StarIcon } from '../../components/icons';

/**
 * Badges on tabs: on a stacked icon, or 4px after an inline label. A badge describes its
 * tab to assistive tech; keep it to four characters, "+" included. `align="center"` makes
 * every tab as wide as the widest and centres the group, and `swipeable` lets a swipe on
 * the panel change tab.
 */
export function TabsBadges() {
  return (
    <div className="flex w-full max-w-[560px] flex-col gap-6">
      <Tabs aria-label="Mailbox" align="center">
        <Tab key="all" title="All" icon={<StarIcon />} badge={<Badge>12</Badge>} />
        <Tab key="sent" title="Sent" icon={<SendIcon />} />
        <Tab key="drafts" title="Drafts" icon={<EditIcon />} badge={<Badge />} />
      </Tabs>
      <Tabs aria-label="Updates" variant="secondary" swipeable>
        <Tab key="new" title="New" badge={<Badge>999+</Badge>}>
          <p className="p-4 text-body-large text-on-surface-variant">Swipe to see older updates.</p>
        </Tab>
        <Tab key="older" title="Older">
          <p className="p-4 text-body-large text-on-surface-variant">Updates you have read.</p>
        </Tab>
      </Tabs>
    </div>
  );
}
