'use client';

import { Accordion, AccordionItem } from '@windmorph/react-pro';

/**
 * Segmented items on a `surface-container` background: each item is its own container, and
 * the open one rounds fully.
 */
export function AccordionSegmented() {
  return (
    <div className="w-full max-w-md rounded-corner-large bg-surface-container p-4">
      <Accordion variant="segmented" defaultExpandedKeys={['returns']}>
        <AccordionItem id="shipping" title="Shipping">
          Orders arrive in two to four working days.
        </AccordionItem>
        <AccordionItem id="returns" title="Returns">
          Free within 30 days, with the label in the box.
        </AccordionItem>
        <AccordionItem id="warranty" title="Warranty">
          Two years on every product, from the day it arrives.
        </AccordionItem>
      </Accordion>
    </div>
  );
}
