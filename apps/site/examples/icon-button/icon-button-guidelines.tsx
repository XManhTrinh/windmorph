import { IconButton } from '@windmorph/react';
import { FavoriteFilledIcon, FavoriteIcon, MoreVertIcon } from '../../components/icons';

/** Do: a toggle icon button for something that can be selected. */
export function IconButtonDoToggle() {
  return (
    <div className="flex items-center gap-3">
      <IconButton
        toggle
        selected={false}
        variant="tonal"
        icon={<FavoriteIcon />}
        selectedIcon={<FavoriteFilledIcon />}
        aria-label="Like"
      />
      <IconButton
        toggle
        selected
        variant="tonal"
        icon={<FavoriteIcon />}
        selectedIcon={<FavoriteFilledIcon />}
        aria-label="Like"
      />
    </div>
  );
}

/** Don't: a toggle for an action with no selected state, such as an overflow menu. */
export function IconButtonDontToggle() {
  return (
    <div className="flex items-center gap-3">
      <IconButton toggle selected variant="filled" icon={<MoreVertIcon />} aria-label="More" />
    </div>
  );
}
