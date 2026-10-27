'use client';

import { List, ListItem } from '@windmorph/react';
import { HomeIcon, SendIcon, StarIcon } from '../../components/icons';

/**
 * A menu of pages: with `href` and no `onAction`, every item is a real link (`<a>`), with
 * the browser's link menu and new-tab clicks. `current` marks the page being shown.
 */
export function ListLinks() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-3 rounded-corner-extra-large bg-surface-container p-3">
      <List aria-label="Settings" variant="segmented">
        <ListItem
          key="profile"
          href="#demo-profile"
          current
          leading={<HomeIcon />}
          supportingText="Name, photos and bio"
        >
          Profile
        </ListItem>
        <ListItem key="notifications" href="#demo-notifications" leading={<SendIcon />}>
          Notifications
        </ListItem>
        <ListItem key="about" href="#demo-about" leading={<StarIcon />}>
          About
        </ListItem>
      </List>
    </div>
  );
}
