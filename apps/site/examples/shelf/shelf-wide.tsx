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
 * A row of wide (16:9) cards named by its heading. Part of the next card always shows at the
 * end; a swipe, a trackpad or Tab moves along it, and with a mouse Previous and Next show on
 * hover. `arrowsAlign="media"` centres the arrows on the picture marked `data-shelf-media`
 * rather than on the whole card.
 */
export function ShelfWide() {
  return (
    <section className="flex w-full flex-col gap-2">
      <h3 id="shelf-series" className="text-title-large text-on-surface">
        Series
      </h3>
      <Shelf aria-labelledby="shelf-series" arrowsAlign="media">
        {TITLES.map((title, index) => (
          <a
            key={title}
            href={`#demo-${title.toLowerCase().replaceAll(' ', '-')}`}
            className="flex flex-col gap-2 rounded-corner-medium text-on-surface outline-offset-2 focus-visible:outline-[3px] focus-visible:outline-secondary"
          >
            <span
              data-shelf-media=""
              className={`block aspect-video w-full rounded-corner-medium ${TONES[index % TONES.length]}`}
            />
            <span className="line-clamp-2 text-title-small">{title}</span>
            <span className="text-body-small text-on-surface-variant">{12 + index} episodes</span>
          </a>
        ))}
      </Shelf>
    </section>
  );
}
