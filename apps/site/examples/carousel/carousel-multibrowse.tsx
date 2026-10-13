import { Carousel } from '@windmorph/react';

const TONES = [
  'bg-primary-container text-on-primary-container',
  'bg-secondary-container text-on-secondary-container',
  'bg-tertiary-container text-on-tertiary-container',
  'bg-primary text-on-primary',
  'bg-secondary text-on-secondary',
  'bg-tertiary text-on-tertiary',
];

/** Coloured panels stand in for images; each fills its slot and is clipped to its keyline. */
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
 * The default `multi-browse` carousel shows large, medium and small items whose sizes
 * change as they scroll. Give it a cross-axis size with `className`. It is a labelled
 * `region` ("carousel"); each item is a "slide" announced as "n of N". Scroll or drag it;
 * a fling crosses several items and then snaps. Tab to an item and use the arrow keys.
 */
export function CarouselMultiBrowse() {
  return (
    <div className="w-full">
      <Carousel aria-label="Photos" className="h-[200px]">
        {slides(10)}
      </Carousel>
    </div>
  );
}
