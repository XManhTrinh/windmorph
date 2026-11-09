'use client';

import { SidePanelRail, SidePanelRailItem } from '@windmorph/react-pro';
import type { CSSProperties } from 'react';
import { MenuBookIcon, PersonIcon, TuneIcon } from '../../components/icons';

/** Links and buttons at the end edge. The arrow hides the strip to a small tab. */
export function SidePanelRailBasic() {
  return (
    <div className="flex h-[360px] w-full overflow-hidden rounded-corner-large bg-surface-container">
      <div className="my-4 ms-4 min-w-0 flex-1 rounded-corner-large bg-surface" />
      <SidePanelRail
        aria-label="More links"
        hideBelow={false}
        style={{ '--wm-side-panel-rail-items-padding-top': '16px' } as CSSProperties}
      >
        <SidePanelRailItem href="#demo-docs" icon={<MenuBookIcon />}>
          Docs
        </SidePanelRailItem>
        <SidePanelRailItem href="#demo-people" icon={<PersonIcon />}>
          People
        </SidePanelRailItem>
        <SidePanelRailItem onPress={() => undefined} icon={<TuneIcon />}>
          Filters
        </SidePanelRailItem>
      </SidePanelRail>
    </div>
  );
}
