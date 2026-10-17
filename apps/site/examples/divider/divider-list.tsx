import { Divider, List, ListItem } from '@windmorph/react';
import { HomeIcon, SendIcon, StarIcon } from '../../components/icons';

/**
 * Dividers that reinforce hierarchy: inset dividers separate related items in a list,
 * aligned past their leading icons, and a full-width divider closes off a different kind of
 * content below. Where items are already apart (a segmented list), leave dividers out.
 */
export function DividerList() {
  return (
    <div className="flex w-full max-w-sm flex-col bg-surface">
      <List aria-label="Folders" dividers="inset">
        <ListItem key="inbox" leading={<HomeIcon />} supportingText="3 new">
          Inbox
        </ListItem>
        <ListItem key="starred" leading={<StarIcon />}>
          Starred
        </ListItem>
        <ListItem key="sent" leading={<SendIcon />}>
          Sent
        </ListItem>
      </List>
      <Divider />
      <p className="px-4 py-3 text-body-medium text-on-surface-variant">
        Storage: 2.1 GB of 15 GB used
      </p>
    </div>
  );
}
