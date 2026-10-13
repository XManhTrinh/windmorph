import { IconButton } from '@windmorph/react';
import { SearchIcon } from '../../components/icons';

/**
 * The four variants. Every icon button needs an accessible name, so each passes
 * `aria-label`. Standard and outlined icon buttons take the surrounding text colour.
 */
export function IconButtonVariants() {
  return (
    <div className="flex items-center gap-4 text-on-surface-variant">
      <IconButton variant="standard" icon={<SearchIcon />} aria-label="Search" />
      <IconButton variant="filled" icon={<SearchIcon />} aria-label="Search" />
      <IconButton variant="tonal" icon={<SearchIcon />} aria-label="Search" />
      <IconButton variant="outlined" icon={<SearchIcon />} aria-label="Search" />
    </div>
  );
}
