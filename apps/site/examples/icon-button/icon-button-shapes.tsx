import { IconButton } from '@windmorph/react';
import { EditIcon, SettingsIcon } from '../../components/icons';

/**
 * Round (the default) and square icon buttons in each colour style. A toggle swaps its shape
 * when selected: round to square, and square to round.
 */
export function IconButtonShapes() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <IconButton size="md" icon={<EditIcon />} aria-label="Edit" />
        <IconButton size="md" variant="tonal" icon={<EditIcon />} aria-label="Edit" />
        <IconButton size="md" variant="outlined" icon={<EditIcon />} aria-label="Edit" />
        <IconButton size="md" variant="standard" icon={<EditIcon />} aria-label="Edit" />
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <IconButton size="md" shape="square" icon={<SettingsIcon />} aria-label="Settings" />
        <IconButton
          size="md"
          shape="square"
          variant="tonal"
          icon={<SettingsIcon />}
          aria-label="Settings"
        />
        <IconButton
          size="md"
          shape="square"
          variant="outlined"
          icon={<SettingsIcon />}
          aria-label="Settings"
        />
        <IconButton
          size="md"
          shape="square"
          variant="standard"
          icon={<SettingsIcon />}
          aria-label="Settings"
        />
      </div>
    </div>
  );
}
