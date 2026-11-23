'use client';

import { VideoPlayer, VideoPlayerSettings } from '@windmorph/react-pro';
import { useState } from 'react';
import { WorkspacePremiumIcon } from '../../components/icons';

const RATES = [0.5, 0.75, 1, 1.25, 1.5, 2, 2.5, 3, 4];

/**
 * `playbackRates` are the speeds < and > step through, and the settings' speed slider runs from
 * the slowest to the fastest of them, here up to 4×. `playbackRatePresets` are the speeds a
 * press away on the Playback speed page; the fastest is locked behind a mark, so pressing it
 * changes nothing and calls `onPlaybackRatePresetPress`. The chosen speed stays when the source
 * changes.
 */
export function VideoPlayerSpeeds() {
  const [note, setNote] = useState('');
  return (
    <div className="flex w-full flex-col gap-2">
      <VideoPlayer
        aria-label="A tour of the components"
        source="/media/bento/bento-dark.mp4"
        poster={{ src: '/media/bento/bento-dark.jpg' }}
        width={1152}
        height={720}
        duration={18}
        playbackRates={RATES}
        playbackRatePresets={[
          1,
          2,
          3,
          { value: 4, leading: <WorkspacePremiumIcon className="size-4" />, disabled: true },
        ]}
        onPlaybackRatePresetPress={(preset) => {
          if (preset.disabled) setNote(`${preset.value}× comes with a subscription.`);
        }}
        settings={<VideoPlayerSettings />}
        className="aspect-[1152/720] w-full max-w-xl rounded-corner-large"
      />
      <p className="text-body-medium text-on-surface-variant" aria-live="polite">
        {note}
      </p>
    </div>
  );
}
