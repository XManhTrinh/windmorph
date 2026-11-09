'use client';

import { Button } from '@windmorph/react';
import { SidePanelRail, SidePanelRailItem } from '@windmorph/react-pro';
import { useState, type CSSProperties } from 'react';
import { MenuBookIcon, PersonIcon } from '../../components/icons';

/** The app owns the state, and can remember it wherever it likes. */
export function SidePanelRailControlled() {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex h-[280px] w-full overflow-hidden rounded-corner-large bg-surface-container">
      <div className="my-4 ms-4 flex min-w-0 flex-1 items-center justify-center rounded-corner-large bg-surface">
        <Button variant="tonal" onPress={() => setOpen((value) => !value)}>
          {open ? 'Hide from the app' : 'Show from the app'}
        </Button>
      </div>
      <SidePanelRail
        aria-label="Resources"
        hideBelow={false}
        open={open}
        onOpenChange={setOpen}
        style={{ '--wm-side-panel-rail-items-padding-top': '16px' } as CSSProperties}
      >
        <SidePanelRailItem href="#demo-docs" icon={<MenuBookIcon />}>
          Docs
        </SidePanelRailItem>
        <SidePanelRailItem href="#demo-people" icon={<PersonIcon />}>
          People
        </SidePanelRailItem>
      </SidePanelRail>
    </div>
  );
}
