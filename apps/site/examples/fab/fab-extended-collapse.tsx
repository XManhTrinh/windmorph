'use client';

import { Button, ExtendedFab } from '@windmorph/react';
import { useState } from 'react';
import { EditIcon } from '../../components/icons';

/**
 * `expanded={false}` collapses the extended FAB to an icon-only square (apps do this while
 * the page scrolls). The label stays in the accessible name while collapsed.
 */
export function FabExtendedCollapse() {
  const [expanded, setExpanded] = useState(true);
  return (
    <div className="flex items-center gap-4">
      <Button variant="outlined" size="sm" onPress={() => setExpanded((value) => !value)}>
        {expanded ? 'Collapse' : 'Expand'}
      </Button>
      <ExtendedFab icon={<EditIcon />} expanded={expanded}>
        Compose
      </ExtendedFab>
    </div>
  );
}
