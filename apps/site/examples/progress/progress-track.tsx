'use client';

import { Button, CircularProgressIndicator, LinearProgressIndicator } from '@windmorph/react';

/**
 * The track and stop dot can change or go. Inside a button, `track={false}` leaves the bare
 * indicator, and `classNames.indicator="stroke-current"` colours it like the label.
 * `trackThickness` draws a thinner track under a thick indicator, and `stopIndicator={false}`
 * drops the dot at the end of a determinate linear track.
 */
export function ProgressTrack() {
  return (
    <div className="flex w-full max-w-[320px] flex-col gap-6">
      <Button
        variant="tonal"
        leadingIcon={
          <CircularProgressIndicator
            track={false}
            aria-label="Saving"
            classNames={{ indicator: 'stroke-current' }}
            className="size-5"
          />
        }
      >
        Saving
      </Button>
      <LinearProgressIndicator
        value={0.6}
        thickness={8}
        trackThickness={4}
        aria-label="Downloading (thin track)"
        className="w-full"
      />
      <LinearProgressIndicator
        value={0.6}
        stopIndicator={false}
        aria-label="Downloading (no stop dot)"
        className="w-full"
      />
      <CircularProgressIndicator
        value={0.6}
        thickness={8}
        trackThickness={4}
        aria-label="60% (thin track)"
      />
    </div>
  );
}
