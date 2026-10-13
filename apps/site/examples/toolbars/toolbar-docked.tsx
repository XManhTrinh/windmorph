import { DockedToolbar, IconButton } from '@windmorph/react';
import { EditIcon, SearchIcon, SendIcon, StarIcon } from '../../components/icons';

/**
 * A docked toolbar is a full-width bar of actions, usually along the bottom of the window
 * (it replaces the bottom app bar). `arrangement` spreads the controls across the bar or
 * centres them. It has `role="toolbar"`, so `aria-label` names it and arrow keys move
 * between its controls.
 */
export function ToolbarDocked() {
  return (
    <div className="flex w-[412px] max-w-full flex-col gap-6">
      {(['space-between', 'centered'] as const).map((arrangement) => (
        <DockedToolbar
          key={arrangement}
          aria-label={`Message actions (${arrangement})`}
          arrangement={arrangement}
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
