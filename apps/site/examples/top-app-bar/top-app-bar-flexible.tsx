import { IconButton, TopAppBar } from '@windmorph/react';
import { ArrowBackIcon, EditIcon, MoreVertIcon } from '../../components/icons';

const back = <IconButton icon={<ArrowBackIcon />} aria-label="Back" />;

/**
 * The flexible bars with centred text: `titleAlign="center"` centres the title and its
 * `subtitle` in the medium and large flexible bars as well as the small one. A long title
 * wraps onto a second line instead of being cut off. An action can be a filled icon button
 * for the screen's main action.
 */
export function TopAppBarFlexible() {
  return (
    <div className="flex w-[412px] max-w-full flex-col gap-4">
      <TopAppBar
        variant="medium"
        title="Weekend menu"
        subtitle="Phở, bánh mì and bún chả"
        titleAlign="center"
        navigationIcon={back}
        actions={<IconButton icon={<MoreVertIcon />} aria-label="More" />}
      />
      <TopAppBar
        variant="large"
        title="Recipes saved for the long weekend away"
        subtitle="12 recipes"
        titleAlign="center"
        navigationIcon={back}
        actions={<IconButton variant="filled" icon={<EditIcon />} aria-label="Edit list" />}
      />
    </div>
  );
}
