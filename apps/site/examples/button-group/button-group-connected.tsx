'use client';

import { Button, ButtonGroup } from '@windmorph/react';
import { useState } from 'react';

/**
 * A connected group with single selection is the M3 Expressive replacement for segmented
 * buttons. Toggle buttons with a `value` form one selection; `disallowEmptySelection`
 * keeps one always chosen. It renders as a `radiogroup` with arrow-key movement.
 */
export function ButtonGroupConnected() {
  const [view, setView] = useState(new Set(['week']));
  return (
    <ButtonGroup
      variant="connected"
      selectionMode="single"
      disallowEmptySelection
      selectedKeys={view}
      onSelectionChange={setView}
      aria-label="Calendar view"
    >
      <Button toggle value="day">
        Day
      </Button>
      <Button toggle value="week">
        Week
      </Button>
      <Button toggle value="month">
        Month
      </Button>
      <Button toggle value="year">
        Year
      </Button>
    </ButtonGroup>
  );
}
