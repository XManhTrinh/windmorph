'use client';

import { List, ListItem, ListSection } from '@windmorph/react';
import { NotificationsIcon, ScheduleIcon, SettingsIcon, StarIcon } from '../../components/icons';

/**
 * Sections: each `ListSection` is a labelled group under a subheader, styled after the
 * navigation drawer's section headline (M3 defines no list subheader). Items take their
 * corners within their section, and ↑ / ↓ move across sections as through one list.
 */
export function ListSections() {
  return (
    <div className="w-full max-w-sm rounded-corner-extra-large bg-surface-container p-3">
      <List aria-label="Preferences" variant="segmented" onAction={() => {}}>
        <ListSection key="alerts" title="Alerts">
          <ListItem key="notifications" leading={<NotificationsIcon />} supportingText="On">
            Notifications
          </ListItem>
          <ListItem key="quiet" leading={<ScheduleIcon />} supportingText="22:00 to 07:00">
            Quiet hours
          </ListItem>
        </ListSection>
        <ListSection key="general" title="General">
          <ListItem key="favourites" leading={<StarIcon />}>
            Favourites
          </ListItem>
          <ListItem key="advanced" leading={<SettingsIcon />}>
            Advanced
          </ListItem>
        </ListSection>
      </List>
    </div>
  );
}
