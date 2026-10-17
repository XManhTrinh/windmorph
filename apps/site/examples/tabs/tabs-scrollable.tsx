'use client';

import { Tab, Tabs } from '@windmorph/react';

const SECTIONS = [
  'Overview',
  'Specifications',
  'Reviews',
  'Questions',
  'Accessories',
  'Shipping',
  'Returns',
];

/**
 * A scrollable row: tabs keep their natural width and the row scrolls, centring the
 * selected tab. Use it when there are more tabs than fit, instead of letting them shrink.
 */
export function TabsScrollable() {
  return (
    <div className="w-full max-w-[360px]">
      <Tabs aria-label="Product" scrollable>
        {SECTIONS.map((title) => (
          <Tab key={title} title={title}>
            <p className="p-4 text-body-large text-on-surface-variant">{title} panel</p>
          </Tab>
        ))}
      </Tabs>
    </div>
  );
}
