'use client';

import { Accordion, AccordionItem } from '@windmorph/react-pro';
import { useState } from 'react';
import { LockIcon, NotificationsIcon, PersonIcon } from '../../components/icons';

/**
 * Settings groups that open side by side (`multiple`), controlled through
 * `expandedKeys`, with leading icons and supporting text.
 */
export function AccordionMultiple() {
  const [expanded, setExpanded] = useState<Set<string | number>>(new Set(['notifications']));
  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      <Accordion multiple expandedKeys={expanded} onExpandedChange={setExpanded}>
        <AccordionItem
          id="account"
          title="Account"
          supportingText="Name, email and password"
          leading={<PersonIcon />}
        >
          Change your name, email address or password.
        </AccordionItem>
        <AccordionItem
          id="notifications"
          title="Notifications"
          supportingText="Email and push"
          leading={<NotificationsIcon />}
        >
          A weekly summary by email, and push notifications for mentions only.
        </AccordionItem>
        <AccordionItem
          id="privacy"
          title="Privacy"
          supportingText="Who sees your profile"
          leading={<LockIcon />}
        >
          Your profile is visible to people you follow.
        </AccordionItem>
      </Accordion>
      <p className="text-body-small text-on-surface-variant">
        Open: {[...expanded].join(', ') || 'none'}
      </p>
    </div>
  );
}
