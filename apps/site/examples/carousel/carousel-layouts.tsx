import { Carousel } from '@windmorph/react';

const TONES = [
  'bg-primary-container text-on-primary-container',
  'bg-secondary-container text-on-secondary-container',
  'bg-tertiary-container text-on-tertiary-container',
  'bg-primary text-on-primary',
  'bg-secondary text-on-secondary',
  'bg-tertiary text-on-tertiary',
];

const ASPECTS = ['aspect-[16/9]', 'aspect-[9/16]', 'aspect-square', 'aspect-[4/5]', 'aspect-[3/2]'];

/**
 * `multi-aspect` items keep their own widths (clamped between 9:16 and 16:9 of the
 * carousel's height), with 16px before the first. `full-screen` shows one edge-to-edge
 * item at a time and scrolls vertically, snapping to each.
 */
export function CarouselLayouts() {
  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex flex-col gap-2">
        <p className="text-label-large text-on-surface-variant">Multi-aspect</p>
        <Carousel aria-label="Clips" variant="multi-aspect" className="h-[200px]">
          {Array.from({ length: 8 }, (_, index) => (
            <div
              key={index}
              className={`flex items-end p-4 text-title-medium ${ASPECTS[index % ASPECTS.length]} ${TONES[index % TONES.length]}`}
            >
              {index + 1}
            </div>
          ))}
        </Carousel>
      </div>
      <div className="flex flex-col gap-2">
        <p className="text-label-large text-on-surface-variant">Full-screen</p>
        <Carousel aria-label="Stories" variant="full-screen" className="h-[360px] w-[220px]">
          {Array.from({ length: 5 }, (_, index) => (
            <div
              key={index}
              className={`flex items-end p-4 text-title-medium ${TONES[index % TONES.length]}`}
            >
              {index + 1}
            </div>
          ))}
        </Carousel>
      </div>
    </div>
  );
}
