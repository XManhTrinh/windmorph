'use client';

import { IconButton, ThemeScope } from '@windmorph/react';
import {
  VideoPlayerSettings,
  VideoPlayerSettingsChoice,
  VideoPlayerSettingsItem,
  VideoPlayerSettingsPage,
  VideoPlayerSettingsSpeed,
  VideoPlayerSettingsSwitch,
  VideoPlayerSettingsTrigger,
} from '@windmorph/react-pro';
import { useState } from 'react';
import {
  InfoIcon,
  RefreshIcon,
  SettingsIcon,
  TuneIcon,
  WorkspacePremiumIcon,
} from '../../components/icons';

/**
 * Alone, `VideoPlayerSettingsTrigger` opens it from a button you draw, inside the positioned
 * element you name (`container`), at one of its corners. Each kind of row: a switch, the speed
 * page (here up to 3×, the fastest preset locked behind a mark), a choice, an action that keeps
 * the panel open, and a page of your own. Under 600px of window it is a bottom sheet with the
 * same pages.
 */
export function VideoPlayerSettingsAlone() {
  const [frame, setFrame] = useState<HTMLElement | null>(null);
  const [loop, setLoop] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [quality, setQuality] = useState('auto');
  const [turns, setTurns] = useState(0);
  const [note, setNote] = useState('');
  return (
    <div className="flex w-full flex-col gap-2">
      <ThemeScope
        mode="dark"
        ref={setFrame}
        className="relative flex aspect-video w-full max-w-xl items-end justify-end rounded-corner-large bg-[linear-gradient(160deg,#1d2b3a,#0b0f14)] p-3"
      >
        <VideoPlayerSettingsTrigger>
          <IconButton variant="standard" icon={<SettingsIcon />} aria-label="Settings" />
          <VideoPlayerSettings container={frame} placement="bottom-end">
            <VideoPlayerSettingsSwitch
              icon={<RefreshIcon />}
              label="Loop"
              selected={loop}
              onChange={setLoop}
            />
            <VideoPlayerSettingsSpeed
              value={speed}
              onChange={setSpeed}
              max={3}
              presets={[
                1,
                1.5,
                2,
                { value: 3, leading: <WorkspacePremiumIcon className="size-4" />, disabled: true },
              ]}
              onPresetPress={(preset) => setNote(`${preset.value}× comes with a subscription.`)}
            />
            <VideoPlayerSettingsChoice
              id="quality"
              icon={<TuneIcon />}
              label="Quality"
              value={quality}
              onChange={setQuality}
              valueLabel={quality === 'auto' ? 'Auto (720p)' : undefined}
              options={[
                { value: '1080', label: '1080p', description: 'Enhanced bitrate' },
                { value: '720', label: '720p' },
                { value: 'auto', label: 'Auto' },
              ]}
            />
            <VideoPlayerSettingsItem
              icon={<RefreshIcon />}
              label="Rotate video"
              value={turns % 4 === 0 ? 'Upright' : `${(turns % 4) * 90}°`}
              closeOnAction={false}
              onAction={() => setTurns((count) => count + 1)}
            />
            <VideoPlayerSettingsPage id="about" icon={<InfoIcon />} label="About this video">
              <p className="px-4 pb-4 text-body-medium">
                Recorded in the studio, autumn 2026. Music by the house band.
              </p>
            </VideoPlayerSettingsPage>
          </VideoPlayerSettings>
        </VideoPlayerSettingsTrigger>
      </ThemeScope>
      <p className="text-body-medium text-on-surface-variant" aria-live="polite">
        {note}
      </p>
    </div>
  );
}
