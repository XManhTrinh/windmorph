'use client';

import { Accordion, AccordionItem, Link } from '@windmorph/react-pro';

/**
 * A long panel with a link, a list and a second paragraph: Tab moves into an open panel. The
 * link points at text in the closed Privacy policy panel, which opens as the link is followed.
 */
export function AccordionLongPanel() {
  return (
    <Accordion defaultExpandedKeys={['data']} className="w-full max-w-md">
      <AccordionItem id="data" title="How do you use my data?">
        <p>
          We keep your address and order history to deliver orders and handle returns. Read the{' '}
          <Link href="#privacy-policy">privacy policy</Link> for the details.
        </p>
        <ul className="my-2 list-disc ps-5">
          <li>Delivery partners see your name and address.</li>
          <li>Payment providers see your payment details.</li>
          <li>Nobody else sees either.</li>
        </ul>
        <p>You can download or delete your data from your account at any time.</p>
      </AccordionItem>
      <AccordionItem id="account" title="Do I need an account?">
        No. Check out as a guest and create an account later.
      </AccordionItem>
      <AccordionItem id="privacy" title="Privacy policy">
        <span id="privacy-policy">
          We only share your details with the partners who deliver and pay for your order.
        </span>
      </AccordionItem>
    </Accordion>
  );
}
