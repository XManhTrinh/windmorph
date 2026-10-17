'use client';

import { List, ListItem } from '@windmorph/react';
import { useState } from 'react';

/**
 * Switch items, as in Android's Settings: the whole item is the switch, so pressing
 * anywhere on it toggles it, and it is one control named by its headline and described by
 * its supporting text. `control="checkbox"` makes checkbox items the same way.
 */
export function ListToggles() {
  const [searchable, setSearchable] = useState(true);
  return (
    <div className="flex w-full max-w-sm flex-col gap-3 rounded-corner-extra-large bg-surface-container p-3">
      <List aria-label="Privacy" variant="segmented">
        <ListItem
          key="search"
          control="switch"
          checked={searchable}
          onCheckedChange={setSearchable}
          supportingText="Search engines like Google can list your profile"
        >
          Show my profile in search engines
        </ListItem>
        <ListItem key="online" control="switch" defaultChecked>
          Show when I&apos;m online
        </ListItem>
        <ListItem key="read" control="switch" switchIcons>
          Read receipts
        </ListItem>
      </List>
      <List aria-label="Notify me about" variant="segmented">
        <ListItem key="messages" control="checkbox" defaultChecked>
          Messages
        </ListItem>
        <ListItem key="offers" control="checkbox">
          Offers on my listings
        </ListItem>
      </List>
    </div>
  );
}
