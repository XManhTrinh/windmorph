import { MediaTimeSlider } from '@windmorph/react-pro';

/**
 * Loaded ranges as `[start, end]` pairs (a media element's `buffered` works as is); an hour-long
 * lecture, whose bubble writes `h:mm:ss`; and a media whose length isn't known yet
 * (`duration` is `NaN` until its metadata loads), which can't be moved. Rest the pointer on a bar
 * to see the time under it.
 */
export function MediaTimeSliderStates() {
  return (
    <div className="flex w-full max-w-lg flex-col gap-2 pt-8">
      <MediaTimeSlider
        aria-label="Episode 4"
        duration={600}
        defaultValue={83}
        buffered={[
          [0, 150],
          [300, 360],
        ]}
      />
      <MediaTimeSlider aria-label="Lecture" duration={5400} defaultValue={1830} buffered={2400} />
      <MediaTimeSlider aria-label="Not loaded yet" duration={Number.NaN} />
    </div>
  );
}
