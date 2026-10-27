'use client';

import { Button, CircularProgressIndicator } from '@windmorph/react';
import { useState } from 'react';

/**
 * `pendingIndicator` replaces the loading indicator, here with a circular progress indicator
 * for a wait that may pass five seconds (M3: "Long (over 5s): Use a progress indicator"). In the
 * button it takes the label's colour and loses its track, as M3 asks.
 */
export function ButtonPendingIndicator() {
  const [exporting, setExporting] = useState(false);
  const exportReport = () => {
    setExporting(true);
    setTimeout(() => setExporting(false), 6000);
  };
  return (
    <Button
      variant="tonal"
      pending={exporting}
      pendingIndicator={<CircularProgressIndicator size={24} aria-label="Exporting" />}
      onPress={exportReport}
    >
      Export report
    </Button>
  );
}
