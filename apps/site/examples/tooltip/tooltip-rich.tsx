'use client';

import { Button, RichTooltip, RichTooltipTrigger } from '@windmorph/react';

/**
 * A rich tooltip carries a subhead, supporting text and an optional action, so it is a
 * non-modal popover. Press the trigger to open it; press again, Escape or a press outside
 * closes it. The `title` names it.
 */
export function TooltipRich() {
  return (
    <RichTooltipTrigger>
      <Button variant="tonal">What are grouped tabs?</Button>
      <RichTooltip caret title="Grouped tabs" action={<Button variant="text">Learn more</Button>}>
        Tabs from the same site stay together, so related pages are easy to find.
      </RichTooltip>
    </RichTooltipTrigger>
  );
}
