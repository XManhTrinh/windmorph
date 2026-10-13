import { FabMenu, FabMenuItem } from '@windmorph/react';
import { AddIcon, CloseIcon, EditIcon, SendIcon } from '../../components/icons';

/**
 * The three colour sets, shown open with `defaultOpen`. The button takes the vibrant role
 * while open and the matching container colour while closed.
 */
export function FabMenuColors() {
  return (
    <div className="flex flex-wrap items-end gap-8">
      {(['primary', 'secondary', 'tertiary'] as const).map((color) => (
        <FabMenu
          key={color}
          defaultOpen
          color={color}
          icon={<AddIcon />}
          openIcon={<CloseIcon />}
          aria-label={`Create ${color}`}
        >
          <FabMenuItem icon={<EditIcon />}>Edit</FabMenuItem>
          <FabMenuItem icon={<SendIcon />}>Send</FabMenuItem>
        </FabMenu>
      ))}
    </div>
  );
}
