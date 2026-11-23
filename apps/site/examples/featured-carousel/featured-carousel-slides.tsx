import { Button } from '@windmorph/react';
import { FeaturedCarousel, FeaturedCarouselSlide } from '@windmorph/react-pro';

const ITEMS = [
  {
    title: 'City after dark',
    line: 'A night walk through the old town',
    fill: 'from-primary to-tertiary',
  },
  {
    title: 'Harbour lights',
    line: 'Boats come home at dusk',
    fill: 'from-inverse-surface to-secondary',
  },
  {
    title: 'Mountain pass',
    line: 'Six days on the high road',
    fill: 'from-tertiary to-primary-container',
  },
  {
    title: 'Night market',
    line: 'Food stalls until the early hours',
    fill: 'from-secondary to-inverse-surface',
  },
];

/**
 * Each slide is your own content: here a picture, a title that is a link and two buttons. Only
 * the current slide is reachable; the others are set back and darker, and a press beside the
 * current one brings that side's slide forward. `wm-featured-carousel-content` keeps the
 * words clear of the side arrows. Left and Right move it while the pointer is over it or
 * focus is in it.
 */
export function FeaturedCarouselSlides() {
  return (
    <FeaturedCarousel aria-label="Featured picks" className="w-full">
      {ITEMS.map((item) => (
        <FeaturedCarouselSlide key={item.title} textValue={item.title}>
          <div className={`flex h-full flex-col justify-end bg-gradient-to-br ${item.fill}`}>
            <div className="wm-featured-carousel-content flex flex-col gap-3 bg-gradient-to-t from-scrim/70 to-transparent pb-6 pt-16">
              <h3 className="text-headline-small text-white">
                <a
                  href={`#demo-${item.title.toLowerCase().replaceAll(' ', '-')}`}
                  className="rounded-corner-extra-small focus-visible:outline-[3px] focus-visible:outline-white"
                >
                  {item.title}
                </a>
              </h3>
              <p className="text-body-medium text-white">{item.line}</p>
              <div className="flex flex-wrap gap-2">
                <Button variant="filled" size="sm">
                  Watch now
                </Button>
                <Button variant="tonal" size="sm">
                  Add to list
                </Button>
              </div>
            </div>
          </div>
        </FeaturedCarouselSlide>
      ))}
    </FeaturedCarousel>
  );
}
