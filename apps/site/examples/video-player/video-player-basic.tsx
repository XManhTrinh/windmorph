import { VideoPlayer } from '@windmorph/react-pro';

/**
 * Complete with nothing set: its own controls, keys, touch gestures and states. Nothing
 * downloads until Play is pressed; `width`, `height` and `duration` give the picture's shape and
 * the time before then. Its keys work while focus is inside it: Space or K, J and L, the
 * arrows, M, F, the digits.
 */
export function VideoPlayerBasic() {
  return (
    <VideoPlayer
      aria-label="A tour of the components"
      source="/media/bento/bento-dark.mp4"
      poster={{ src: '/media/bento/bento-dark.jpg' }}
      width={1152}
      height={720}
      duration={18}
      className="aspect-[1152/720] w-full max-w-2xl rounded-corner-large"
    />
  );
}
