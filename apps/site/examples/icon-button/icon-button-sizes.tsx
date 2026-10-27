import { IconButton } from '@windmorph/react';
import { SearchIcon } from '../../components/icons';

/**
 * The five sizes, and the three container widths (narrow / default / wide) at the medium
 * size. Width is the icon size plus the leading and trailing space.
 */
export function IconButtonSizes() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-4">
        <IconButton variant="tonal" size="xs" icon={<SearchIcon />} aria-label="Search" />
        <IconButton variant="tonal" size="sm" icon={<SearchIcon />} aria-label="Search" />
        <IconButton variant="tonal" size="md" icon={<SearchIcon />} aria-label="Search" />
        <IconButton variant="tonal" size="lg" icon={<SearchIcon />} aria-label="Search" />
        <IconButton variant="tonal" size="xl" icon={<SearchIcon />} aria-label="Search" />
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <IconButton
          variant="filled"
          size="md"
          width="narrow"
          icon={<SearchIcon />}
          aria-label="Search narrow"
        />
        <IconButton
          variant="filled"
          size="md"
          width="default"
          icon={<SearchIcon />}
          aria-label="Search default"
        />
        <IconButton
          variant="filled"
          size="md"
          width="wide"
          icon={<SearchIcon />}
          aria-label="Search wide"
        />
      </div>
    </div>
  );
}
