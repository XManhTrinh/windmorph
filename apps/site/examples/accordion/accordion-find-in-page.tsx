'use client';

import { Accordion, AccordionItem, Link } from '@windmorph/react-pro';

/**
 * Closed panels stay in the page (`hidden="until-found"`), so a `#fragment` link to text in a
 * closed answer opens it, as the browser's find-in-page does.
 */
export function AccordionFindInPage() {
  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      <Link href="#refund-window" variant="standalone">
        How long do refunds take?
      </Link>
      <Accordion>
        <AccordionItem id="delivery" title="Delivery">
          Orders leave the warehouse within a day.
        </AccordionItem>
        <AccordionItem id="refunds" title="Refunds">
          <span id="refund-window">Refunds reach your account within five working days.</span>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
