'use client';

import { Button, IconButton, TopAppBar } from '@windmorph/react';
import { SearchIcon } from '../../components/icons';

/** A top bar and a flat, full-width page that scrolls with the window. */
export function AppFramePublic() {
  return (
    <div className="flex min-h-dvh flex-col bg-surface text-on-surface">
      <TopAppBar
        variant="small"
        title="Workspace"
        scrollBehavior="pinned"
        className="sticky top-0 z-20"
        actions={<IconButton variant="standard" icon={<SearchIcon />} aria-label="Search" />}
      />
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 p-6">
        <h1 className="m-0 text-headline-large">Welcome</h1>
        {Array.from({ length: 12 }, (_, index) => (
          <p key={index} className="m-0 text-body-large text-on-surface-variant">
            A public page sits flat on the surface, across the whole window. Section {index + 1}.
          </p>
        ))}
        <Button className="self-start">Get started</Button>
      </main>
    </div>
  );
}
