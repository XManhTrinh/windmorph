'use client';

import { Fab } from '@windmorph/react';
import { useState } from 'react';
import { EditIcon } from '../../components/icons';

const TABS = ['Inbox', 'Starred', 'Sent'];

/**
 * `visible` hides the FAB towards its centre and shows it again, e.g. around a page change.
 * On a tab change, a new `key` with `appear` replays the entrance, so the FAB briefly
 * disappears and reappears while the new content moves into place. Reduced motion keeps
 * only the fade.
 */
export function FabVisibility() {
  const [visible, setVisible] = useState(true);
  const [tab, setTab] = useState(0);
  return (
    <div className="flex flex-col items-start gap-4">
      <div className="flex flex-wrap gap-4">
        <button
          type="button"
          className="text-label-large text-primary underline"
          onClick={() => setVisible((value) => !value)}
        >
          {visible ? 'Hide' : 'Show'}
        </button>
        {TABS.map((name, index) => (
          <button
            key={name}
            type="button"
            aria-pressed={tab === index}
            className="text-label-large text-primary underline aria-pressed:no-underline"
            onClick={() => setTab(index)}
          >
            {name}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-6">
        <Fab visible={visible} size="medium" icon={<EditIcon />} aria-label="Compose" />
        <Fab key={tab} appear icon={<EditIcon />} aria-label={`New in ${TABS[tab]}`} />
      </div>
    </div>
  );
}
