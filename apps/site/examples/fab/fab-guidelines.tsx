import { Fab } from '@windmorph/react';
import { DeleteIcon, EditIcon, SearchIcon, ShareIcon } from '../../components/icons';

/** A small screen the FAB sits on. */
function Screen({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative h-44 w-full max-w-64 rounded-corner-large border border-outline-variant bg-surface">
      <div className="flex flex-col gap-2 p-4">
        <span className="h-3 w-3/4 rounded-full bg-surface-container-highest" />
        <span className="h-3 w-1/2 rounded-full bg-surface-container-highest" />
        <span className="h-3 w-2/3 rounded-full bg-surface-container-highest" />
      </div>
      {children}
    </div>
  );
}

/** Do: one FAB for the screen's main, positive action, with a clear icon. */
export function FabDoOne() {
  return (
    <Screen>
      <Fab icon={<EditIcon />} aria-label="Compose" className="absolute end-4 bottom-4" />
    </Screen>
  );
}

/** Don't: several FABs on one screen. */
export function FabDontMany() {
  return (
    <Screen>
      <div className="absolute end-4 bottom-4 flex gap-2">
        <Fab icon={<SearchIcon />} aria-label="Search" />
        <Fab icon={<ShareIcon />} aria-label="Share" />
        <Fab icon={<EditIcon />} aria-label="Compose" />
      </div>
    </Screen>
  );
}

/** Do: a FAB for a constructive action, such as composing. */
export function FabDoPositive() {
  return <Fab size="md" icon={<EditIcon />} aria-label="Compose" />;
}

/** Don't: a FAB for a destructive action. */
export function FabDontDestructive() {
  return <Fab size="md" icon={<DeleteIcon />} aria-label="Delete" />;
}
