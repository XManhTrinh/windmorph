'use client';

import { Accordion, AccordionItem } from '@windmorph/react-pro';

/** A FAQ: one answer open at a time, the first one open from the start. */
export function AccordionFaq() {
  return (
    <Accordion defaultExpandedKeys={['shipping']} className="w-full max-w-md">
      <AccordionItem id="shipping" title="How long does shipping take?">
        Orders leave the warehouse within a day and arrive in two to four working days. Tracking
        comes by email once the parcel is on its way.
      </AccordionItem>
      <AccordionItem id="returns" title="Can I return an order?">
        Yes, within 30 days, for a full refund. The return label is in the box.
      </AccordionItem>
      <AccordionItem id="care" title="How do I wash it?">
        Machine wash cold with similar colours, and dry flat away from direct heat.
      </AccordionItem>
    </Accordion>
  );
}
