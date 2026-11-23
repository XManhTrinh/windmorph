'use client';

import { FunnelBars } from '@windmorph/react-pro/charts';

const CHECKOUT = [
  { key: 'viewed', label: 'Viewed a product', value: 4200 },
  { key: 'cart', label: 'Added to cart', value: 1200 },
  { key: 'details', label: 'Entered delivery details', value: 780 },
  { key: 'payment', label: 'Chose how to pay', value: 610 },
  { key: 'paid', label: 'Paid', value: 548 },
];

/**
 * A checkout's steps in the order people take them, never ranked, on one scale. Each step after
 * the first says what share of the step before reached it, so the biggest drop stands out.
 */
export function RankedBarsFunnel() {
  return <FunnelBars aria-label="Checkout" steps={CHECKOUT} className="w-full max-w-lg" />;
}
