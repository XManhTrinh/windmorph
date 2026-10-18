import { Carousel } from '@windmorph/react';

const TONES = [
  'bg-primary-container text-on-primary-container',
  'bg-secondary-container text-on-secondary-container',
  'bg-tertiary-container text-on-tertiary-container',
  'bg-primary text-on-primary',
  'bg-secondary text-on-secondary',
  'bg-tertiary text-on-tertiary',
];

/**
 * A `hero` carousel shows one large item at a time with a small one peeking at its end,
 * and swipes through one item at a time. It is start-aligned by default;
 * `heroAlignment="center"` puts a small item on each side.
 */
export function CarouselHero() {
  return (
    <div className="w-full">
      <Carousel aria-label="Highlights" variant="hero" className="h-[200px]">
        {Array.from({ length: 6 }, (_, index) => (
          <div
            key={index}
            className={`flex size-full items-end p-4 text-title-medium ${TONES[index % TONES.length]}`}
          >
            {index + 1}
          </div>
        ))}
      </Carousel>
    </div>
  );
}
