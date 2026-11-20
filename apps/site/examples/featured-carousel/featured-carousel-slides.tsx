import { Button } from '@windmorph/react';
import { FeaturedCarousel, FeaturedCarouselSlide } from '@windmorph/react-pro';

const ITEMS = [
  {
    title: 'City after dark',
    line: 'A night walk through the old town',
    tone: 'from-primary to-tertiary',
  },
  {
    title: 'Harbour lights',
    line: 'Boats come home at dusk',
    tone: 'from-inverse-surface to-secondary',
  },
  {
    title: 'Mountain pass',
    line: 'Six days on the high road',
    tone: 'from-tertiary to-primary-container',
  },
  {
    title: 'Night market',
    line: 'Food stalls until the early hours',
    tone: 'from-secondary to-inverse-surface',
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
    <FeaturedCarousel aria-label="Featured" className="w-full">
      {ITEMS.map((item) => (
        <FeaturedCarouselSlide key={item.title} textValue={item.title}>
          <div className={`flex h-full flex-col justify-end bg-gradient-to-br ${item.tone}`}>
            <div className="wm-featured-carousel-content flex flex-col gap-3 bg-gradient-to-t from-scrim/70 to-transparent pb-6 pt-16">
              <h3 className="text-headline-small text-white">
                <a
                  href={`#${item.title}`}
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
