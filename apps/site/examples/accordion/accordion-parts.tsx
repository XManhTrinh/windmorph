'use client';

import { Accordion, AccordionHeader, AccordionItem, AccordionPanel } from '@windmorph/react-pro';
import { HelpIcon } from '../../components/icons';

/**
 * A header built from parts (`AccordionHeader` and `AccordionPanel`) beside a disabled item,
 * which the arrow keys skip.
 */
export function AccordionParts() {
  return (
    <Accordion variant="segmented" className="w-full max-w-md">
      <AccordionItem id="order">
        <AccordionHeader leading={<HelpIcon />}>Can I change my order?</AccordionHeader>
        <AccordionPanel>Yes, until it ships. Open the order and choose Edit.</AccordionPanel>
      </AccordionItem>
      <AccordionItem id="gift" title="Gift wrapping" supportingText="Back in December" disabled>
        Gift wrapping returns for the holidays.
      </AccordionItem>
      <AccordionItem id="sizing" title="Sizing">
        Each product page has a size chart in centimetres and inches.
      </AccordionItem>
    </Accordion>
  );
}
