import { DurationTag, MediaFrame } from '@windmorph/react-pro';

const VIDEOS = [
  { title: 'A night walk through the old town', seconds: 252, picture: 'bg-inverse-surface' },
  { title: 'Six days on the high road', seconds: 3723, picture: 'bg-tertiary-container' },
  { title: 'Boats come home at dusk', seconds: 47, picture: 'bg-white' },
];

/**
 * Each card is one link: the picture's `MediaFrame` holds the picture, then the tag last, so
 * nothing laid over the picture covers it. The tag reads "Length 4 minutes, 12 seconds" as
 * part of the link's name, while the eye gets the clock.
 */
export function DurationTagCard() {
  return (
    <ul className="grid w-full max-w-3xl grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4">
      {VIDEOS.map((video) => (
        <li key={video.title}>
          <a
            href={`#${video.title}`}
            className="flex flex-col gap-2 rounded-corner-medium text-on-surface outline-offset-2 focus-visible:outline-[3px] focus-visible:outline-secondary"
          >
            <MediaFrame ratio="16/9" className="w-full">
              <span className={video.picture} />
              <DurationTag duration={video.seconds} />
            </MediaFrame>
            <span className="text-title-small">{video.title}</span>
          </a>
        </li>
      ))}
    </ul>
  );
}
