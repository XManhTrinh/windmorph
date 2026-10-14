import { DockedToolbar, IconButton } from '@windmorph/react';
import { EditIcon, SearchIcon, SendIcon, StarIcon } from '../../components/icons';

/**
 * A docked toolbar is a full-width bar of actions along the bottom of the window (it
 * replaces the bottom app bar). By default its controls sit 32px apart in the centre;
 * `className="gap-2"` gives the spec's centred alternative with 8px between them, and
 * `arrangement="space-between"` spreads them evenly, as M3 recommends in compact windows.
 * It has `role="toolbar"`, named by `aria-label`; Tab and the arrow keys move between its
 * controls.
 */
export function ToolbarDocked() {
  return (
    <div className="flex w-[412px] max-w-full flex-col gap-6">
      {(
        [
          ['centered', ''],
          ['centered', 'gap-2'],
          ['space-between', ''],
        ] as const
      ).map(([arrangement, gap]) => (
        <DockedToolbar
          key={`${arrangement} ${gap}`}
          aria-label={`Message actions (${arrangement}${gap ? ', 8px apart' : ''})`}
          arrangement={arrangement}
          className={gap}
        >
          <IconButton icon={<SearchIcon />} aria-label="Search" />
          <IconButton icon={<StarIcon />} aria-label="Starred" />
          <IconButton icon={<SendIcon />} aria-label="Sent" />
          <IconButton variant="filled" icon={<EditIcon />} aria-label="Compose" />
        </DockedToolbar>
      ))}
    </div>
  );
}
