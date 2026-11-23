'use client';

import { VideoPlayer, VideoPlayerSettings, VideoPlayerSettingsChoice } from '@windmorph/react-pro';
import { useState } from 'react';
import { TuneIcon } from '../../components/icons';

const HD = (
  <span className="rounded-corner-extra-small bg-error px-0.5 text-label-small-emphasized text-on-error">
    HD
  </span>
);

const QUALITIES = [
  { value: '1080', label: '1080p', description: 'Enhanced bitrate', badge: HD },
  { value: '720', label: '720p', badge: HD },
  { value: '480', label: '480p' },
  { value: 'auto', label: 'Auto' },
];

/**
 * In the player's `settings` slot the player gives the button, the corner and the room: no
 * trigger or container to write. As a function, `children` places the rows the player fills
 * (Playback speed, Captions, Loop…) among yours: here Quality comes second, and Loop, left out,
 * doesn't show. A text badge is read after the label ("1080p HD"). A choice closes the panel
 * and hands focus back to the gear. `settingsBadge` marks the gear.
 */
export function VideoPlayerSettingsSlot() {
  const [quality, setQuality] = useState('auto');
  return (
    <VideoPlayer
      aria-label="A tour of the components"
      source="/media/bento/bento-dark.mp4"
      poster={{ src: '/media/bento/bento-dark.jpg' }}
      width={1152}
      height={720}
      duration={18}
      captions={[
        { lang: 'en', src: '/media/captions/tour-en.vtt' },
        { lang: 'fr', src: '/media/captions/tour-fr.vtt' },
      ]}
      settingsBadge={quality === '1080' ? HD : undefined}
      settings={
        <VideoPlayerSettings>
          {(rows) => (
            <>
              {rows.speed}
              <VideoPlayerSettingsChoice
                id="quality"
                icon={<TuneIcon />}
                label="Quality"
                value={quality}
                onChange={setQuality}
                valueLabel={quality === 'auto' ? 'Auto (720p)' : undefined}
                options={QUALITIES}
              />
              {rows.captions}
            </>
          )}
        </VideoPlayerSettings>
      }
      className="aspect-[1152/720] w-full max-w-2xl rounded-corner-large"
    />
  );
}
