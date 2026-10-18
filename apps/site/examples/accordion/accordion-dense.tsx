'use client';

import { Accordion, AccordionItem } from '@windmorph/react-pro';
import { MailIcon, NotificationsIcon, ScheduleIcon } from '../../components/icons';

/** Density −3: headers 44px tall with one line and 60px with two, as a core list's rows. */
export function AccordionDense() {
  return (
    <Accordion density={-3} defaultExpandedKeys={['email']} className="w-full max-w-md">
      <AccordionItem id="email" title="Email" supportingText="Weekly" leading={<MailIcon />}>
        A summary every Monday morning.
      </AccordionItem>
      <AccordionItem
        id="push"
        title="Push"
        supportingText="Mentions only"
        leading={<NotificationsIcon />}
      >
        Mentions and replies, nothing else.
      </AccordionItem>
      <AccordionItem
        id="quiet"
        title="Quiet hours"
        supportingText="22:00 to 07:00"
        leading={<ScheduleIcon />}
      >
        Notifications wait until the morning.
      </AccordionItem>
    </Accordion>
  );
}
