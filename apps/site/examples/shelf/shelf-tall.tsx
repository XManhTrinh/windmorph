import { Shelf } from '@windmorph/react-pro';

/** The cards' titles. */
const TITLES = [
  'Harbour lights',
  'Mountain pass',
  'Night market',
  'Old town',
  'River walk',
  'Desert road',
  'Northern coast',
  'Glass house',
  'Winter garden',
  'Lantern street',
];

/** Pictures in the theme's tones, standing in for each card's photo. */
const TONES = [
  'bg-primary-container',
  'bg-inverse-surface',
  'bg-tertiary-container',
  'bg-secondary',
  'bg-surface-container-highest',
];

/**
 * `per="tall"` fits more cards to a line, for 9:16 pictures (2.4 under 600px of shelf, up to
 * 9.3 from 1600px). The number of cards follows the shelf's own width, not the window's, so a
 * shelf in a narrow column steps down on its own.
 */
export function ShelfTall() {
  return (
    <section className="flex w-full flex-col gap-2">
      <h3 id="shelf-short" className="text-title-large text-on-surface">
        Short videos
      </h3>
      <Shelf aria-labelledby="shelf-short" per="tall">
        {TITLES.map((title, index) => (
          <a
            key={title}
            href={`#demo-${title.toLowerCase().replaceAll(' ', '-')}`}
            className="grid overflow-hidden rounded-corner-medium text-on-surface outline-offset-2 *:[grid-area:1/1] focus-visible:outline-[3px] focus-visible:outline-secondary"
          >
            <span className={`block aspect-[9/16] w-full ${TONES[index % TONES.length]}`} />
            <span className="self-end bg-scrim/60 p-2 text-label-large text-white">{title}</span>
          </a>
        ))}
      </Shelf>
    </section>
  );
}
