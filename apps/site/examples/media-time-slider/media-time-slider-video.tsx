import { ThemeScope } from '@windmorph/react';
import { MediaTimeSlider } from '@windmorph/react-pro';

/**
 * Controls over a video take the dark scheme with a `ThemeScope`, so the bar reads on the
 * picture in every theme; its colours are `--wm-media-time-slider-*` tokens for anything else.
 */
export function MediaTimeSliderVideo() {
  return (
    <ThemeScope
      mode="dark"
      className="flex aspect-video w-full max-w-lg flex-col justify-end rounded-corner-large bg-[linear-gradient(160deg,#1d2b3a,#0b0f14)] px-4"
    >
      <MediaTimeSlider
        aria-label="Position in the video"
        duration={212}
        defaultValue={140}
        buffered={180}
      />
    </ThemeScope>
  );
}
