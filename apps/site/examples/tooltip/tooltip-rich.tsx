'use client';

import { Button, RichTooltip, RichTooltipTrigger } from '@windmorph/react';

/**
 * A rich tooltip carries a subhead, supporting text and an optional action. By default it's
 * transient, like a plain tooltip: hover, focus or a touch long press shows it below and to
 * the end of its trigger, and it leaves 1.5s after the pointer or focus does. With an action
 * keyboard users must reach, make it `persistent`: a press opens it as a non-modal popover,
 * and pressing again, Escape or a press outside closes it. The `title` names it.
 */
export function TooltipRich() {
  return (
    <div className="flex flex-wrap gap-4">
      <RichTooltipTrigger>
        <Button variant="tonal">Grouped tabs</Button>
        <RichTooltip title="Grouped tabs">
          Tabs from the same site stay together, so related pages are easy to find.
        </RichTooltip>
      </RichTooltipTrigger>
      <RichTooltipTrigger persistent>
        <Button variant="tonal">What are grouped tabs?</Button>
        <RichTooltip caret title="Grouped tabs" action={<Button variant="text">Learn more</Button>}>
          Tabs from the same site stay together, so related pages are easy to find.
        </RichTooltip>
      </RichTooltipTrigger>
    </div>
  );
}
