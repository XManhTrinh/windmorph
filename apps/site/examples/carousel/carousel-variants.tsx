import { Carousel } from '@windmorph/react';

const TONES = [
  'bg-primary-container text-on-primary-container',
  'bg-secondary-container text-on-secondary-container',
  'bg-tertiary-container text-on-tertiary-container',
  'bg-primary text-on-primary',
  'bg-secondary text-on-secondary',
  'bg-tertiary text-on-tertiary',
];

function slides(count: number) {
  return Array.from({ length: count }, (_, index) => (
    <div
      key={index}
      className={`flex size-full items-end p-4 text-title-medium ${TONES[index % TONES.length]}`}
    >
      {index + 1}
    </div>
  ));
}

/**
 * The `uncontained` and `hero` variants. Uncontained shows items of one size (`itemSize`)
 * that flow past the end edge, scrolling freely (`snap="item"` snaps it); hero shows one large item with small ones
 * beside it (`heroAlignment="center"` here centres it).
 */
export function CarouselVariants() {
  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex flex-col gap-2">
        <p className="text-label-large text-on-surface-variant">Uncontained</p>
        <Carousel aria-label="Cards" variant="uncontained" itemSize={160} className="h-[200px]">
          {slides(8)}
        </Carousel>
      </div>
      <div className="flex flex-col gap-2">
        <p className="text-label-large text-on-surface-variant">Hero, centred</p>
        <Carousel aria-label="Featured" variant="hero" heroAlignment="center" className="h-[200px]">
          {slides(6)}
        </Carousel>
      </div>
    </div>
  );
}
