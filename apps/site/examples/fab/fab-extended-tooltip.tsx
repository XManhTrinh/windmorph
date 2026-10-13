'use client';

import { ExtendedFab } from '@windmorph/react';
import { useRef, useState, type UIEvent } from 'react';
import { EditIcon } from '../../components/icons';

const MESSAGES = ['Alex', 'Sam', 'Priya', 'Zoë', 'Jordan', 'Morgan', 'Taylor', 'Chris'];

/**
 * An extended FAB that collapses while the list scrolls down. Collapsed, it is icon-only,
 * so hovering or focusing it shows its label in a tooltip, as M3 asks of icon-only FABs on
 * the web; expanded, the label is visible and there is no tooltip. Pass `tooltip={false}`
 * to turn it off, or wrap the FAB in your own `TooltipTrigger`, which it steps aside for.
 */
export function FabExtendedTooltip() {
  const [expanded, setExpanded] = useState(true);
  const lastTop = useRef(0);
  const onScroll = (event: UIEvent<HTMLDivElement>) => {
    const top = event.currentTarget.scrollTop;
    setExpanded(top <= 0 || top < lastTop.current);
    lastTop.current = top;
  };
  return (
    <div className="relative h-[280px] w-full max-w-[400px] overflow-hidden rounded-corner-large bg-surface-container-low">
      <div className="h-full overflow-y-auto" onScroll={onScroll}>
        <ul className="flex flex-col p-4 pb-24">
          {MESSAGES.map((name) => (
            <li key={name} className="py-4 text-body-large text-on-surface">
              Message from {name}
            </li>
          ))}
        </ul>
      </div>
      <ExtendedFab icon={<EditIcon />} expanded={expanded} className="absolute end-4 bottom-4">
        Compose
      </ExtendedFab>
    </div>
  );
}
