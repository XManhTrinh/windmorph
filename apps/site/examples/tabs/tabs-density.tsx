'use client';

import { DENSITIES, Tab, Tabs } from '@windmorph/react';
import { EditIcon, SendIcon, StarIcon } from '../../components/icons';

/**
 * Web density, 0 to -3: each step takes 4px off the tabs (48px at 0, 36px at -3; 64px to 52px
 * with icons above). `density` sets the tab row only, not the panels. Here each row sets it;
 * in an app, set it once on `ThemeProvider` from a setting, since M3 makes density the
 * reader's choice.
 */
export function TabsDensity() {
  return (
    <div className="grid w-full grid-cols-1 gap-6 medium:grid-cols-2">
      {DENSITIES.map((density) => (
        <div key={density} className="flex flex-col gap-2">
          <p className="text-title-small">{`Density ${density}`}</p>
          <Tabs aria-label={`Inbox, density ${density}`} density={density}>
            <Tab key="all" title="All" icon={<StarIcon />} />
            <Tab key="sent" title="Sent" icon={<SendIcon />} />
            <Tab key="drafts" title="Drafts" icon={<EditIcon />} />
          </Tabs>
        </div>
      ))}
    </div>
  );
}
