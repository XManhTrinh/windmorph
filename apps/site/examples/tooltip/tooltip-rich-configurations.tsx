'use client';

import { Button, RichTooltip, RichTooltipTrigger } from '@windmorph/react';

const TEXT = 'Saved posts sync to every device you sign in on.';

/**
 * The spec's rich tooltip configurations: a subhead or none, with no, one or two text
 * buttons. Tooltips with actions are `persistent`, so keyboard users can reach them; one
 * without a subhead is named with `aria-label`.
 */
export function TooltipRichConfigurations() {
  return (
    <div className="flex flex-wrap gap-3">
      <RichTooltipTrigger persistent>
        <Button variant="outlined">Subhead, two buttons</Button>
        <RichTooltip
          title="Saved posts"
          action={
            <>
              <Button variant="text">Not now</Button>
              <Button variant="text">Turn on sync</Button>
            </>
          }
        >
          {TEXT}
        </RichTooltip>
      </RichTooltipTrigger>
      <RichTooltipTrigger persistent>
        <Button variant="outlined">Subhead, one button</Button>
        <RichTooltip title="Saved posts" action={<Button variant="text">Learn more</Button>}>
          {TEXT}
        </RichTooltip>
      </RichTooltipTrigger>
      <RichTooltipTrigger>
        <Button variant="outlined">Subhead only</Button>
        <RichTooltip title="Saved posts">{TEXT}</RichTooltip>
      </RichTooltipTrigger>
      <RichTooltipTrigger persistent>
        <Button variant="outlined">One button</Button>
        <RichTooltip aria-label="Saved posts" action={<Button variant="text">Learn more</Button>}>
          {TEXT}
        </RichTooltip>
      </RichTooltipTrigger>
      <RichTooltipTrigger persistent>
        <Button variant="outlined">Two buttons</Button>
        <RichTooltip
          aria-label="Saved posts"
          action={
            <>
              <Button variant="text">Not now</Button>
              <Button variant="text">Turn on sync</Button>
            </>
          }
        >
          {TEXT}
        </RichTooltip>
      </RichTooltipTrigger>
    </div>
  );
}
