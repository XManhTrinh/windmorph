'use client';

import { IconButton } from '@windmorph/react';
import { MediaTimeSlider } from '@windmorph/react-pro';
import { useEffect, useState } from 'react';
import { PauseIcon, PlayArrowIcon } from '../../components/icons';

const LENGTH = 214;

/** `m:ss`, for the player's own time labels beside the slider. */
const clock = (seconds: number) =>
  `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;

/**
 * A player's controls. The slider follows the playing time (`value`), and the player seeks when
 * a drag ends or a key moves it (`onChangeEnd`); while dragged, and until the seek lands, the
 * slider holds where it was put. The loaded part grows ahead of the playhead.
 */
export function MediaTimeSliderPlayer() {
  const [playing, setPlaying] = useState(false);
  const [position, setPosition] = useState(38);
  const [loaded, setLoaded] = useState(90);
  useEffect(() => {
    if (!playing) return;
    const timer = setInterval(() => {
      setPosition((time) => {
        if (time + 0.25 >= LENGTH) setPlaying(false);
        return Math.min(LENGTH, time + 0.25);
      });
      setLoaded((end) => Math.min(LENGTH, end + 1));
    }, 250);
    return () => clearInterval(timer);
  }, [playing]);
  return (
    <div className="flex w-full max-w-lg items-center gap-2 rounded-corner-large bg-surface-container px-2">
      <IconButton
        icon={playing ? <PauseIcon /> : <PlayArrowIcon />}
        aria-label={playing ? 'Pause' : 'Play'}
        onPress={() => setPlaying((value) => !value)}
      />
      <span className="text-label-medium text-on-surface-variant tabular-nums">
        {clock(position)}
      </span>
      <MediaTimeSlider
        aria-label="Position"
        duration={LENGTH}
        value={position}
        onChangeEnd={setPosition}
        buffered={[[0, loaded]]}
        className="flex-1"
      />
      <span className="text-label-medium text-on-surface-variant tabular-nums">
        {clock(LENGTH)}
      </span>
    </div>
  );
}
