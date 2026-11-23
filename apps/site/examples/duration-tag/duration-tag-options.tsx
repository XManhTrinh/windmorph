import { DurationTag, MediaFrame } from '@windmorph/react-pro';
import type { CSSProperties } from 'react';

/**
 * `raised` lifts the tag clear of a line along the picture's foot (here, how much has been
 * watched); `placement` picks a corner; an hour or more shows `h:mm:ss`. A rounder frame
 * (`--wm-media-frame-corner`) moves the tag in far enough to clear its curve. `label` replaces
 * what is read, and `formatDuration` the clock.
 */
export function DurationTagOptions() {
  return (
    <div className="flex flex-wrap items-start gap-4">
      <MediaFrame ratio="16/9" className="w-48">
        <span className="bg-inverse-surface" />
        <span className="h-1 w-3/5 self-end bg-primary" />
        <DurationTag duration={734} raised />
      </MediaFrame>
      <MediaFrame ratio="16/9" className="w-48">
        <span className="bg-tertiary-container" />
        <DurationTag duration={3723} placement="top-start" />
      </MediaFrame>
      <MediaFrame
        ratio="16/9"
        className="w-48"
        style={{ '--wm-media-frame-corner': '28px' } as CSSProperties}
      >
        <span className="bg-secondary" />
        <DurationTag duration={252} label="Runs about 4 minutes" />
      </MediaFrame>
      <MediaFrame ratio="16/9" className="w-48">
        <span className="bg-primary-container" />
        <DurationTag
          duration={5400}
          formatDuration={(seconds, locale) =>
            new Intl.NumberFormat(locale, { style: 'unit', unit: 'minute' }).format(
              Math.floor(seconds / 60),
            )
          }
        />
      </MediaFrame>
    </div>
  );
}
