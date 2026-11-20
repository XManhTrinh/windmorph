'use client';

import { ReorderList, ReorderListItem } from '@windmorph/react-pro';
import { useState } from 'react';

const STEPS = [
  { id: 'soak', title: 'Soak the beans', line: 'Overnight, in cold water' },
  { id: 'rinse', title: 'Rinse and drain', line: 'Twice, until the water runs clear' },
  { id: 'simmer', title: 'Simmer', line: 'Forty minutes, half covered' },
  { id: 'season', title: 'Season', line: 'Salt, pepper and a bay leaf' },
  { id: 'rest', title: 'Let it rest', line: 'Ten minutes off the heat' },
];

/**
 * Drag a row by its handle with a mouse, a finger or a pen; or focus the handle and press the
 * Up and Down arrow keys (Home and End for the ends); or press it for the move menu. The list
 * is controlled: `onReorder` hands over every key in the new order, once, when a move lands.
 */
export function ReorderListSteps() {
  const [order, setOrder] = useState(STEPS.map((step) => step.id));
  return (
    <ReorderList
      aria-label="Recipe steps"
      className="w-full max-w-md"
      onReorder={(keys) => setOrder(keys as string[])}
    >
      {order.map((id) => {
        const step = STEPS.find((item) => item.id === id)!;
        return (
          <ReorderListItem key={id} textValue={step.title}>
            <div className="flex flex-col">
              <span className="text-body-large text-on-surface">{step.title}</span>
              <span className="text-body-medium text-on-surface-variant">{step.line}</span>
            </div>
          </ReorderListItem>
        );
      })}
    </ReorderList>
  );
}
