import { IconButton } from '@windmorph/react';
import { SearchIcon } from '../../components/icons';

/**
 * The four variants; filled is the default. Every icon button needs an accessible name, so
 * each passes `aria-label`, which also shows as a tooltip on hover and keyboard focus.
 */
export function IconButtonVariants() {
  return (
    <div className="flex items-center gap-4">
      <IconButton icon={<SearchIcon />} aria-label="Search" />
      <IconButton variant="tonal" icon={<SearchIcon />} aria-label="Search" />
      <IconButton variant="outlined" icon={<SearchIcon />} aria-label="Search" />
      <IconButton variant="standard" icon={<SearchIcon />} aria-label="Search" />
    </div>
  );
}
