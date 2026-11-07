'use client';

import { useTheme } from '@windmorph/react';

/** Reads the theme context inside the streamed boundary. */
export function ResolvedMode() {
  const { mode, resolvedMode } = useTheme();
  return (
    <p data-testid="streaming-resolved-mode" className="text-body-medium">
      Mode: {mode} (resolved: {resolvedMode})
    </p>
  );
}
