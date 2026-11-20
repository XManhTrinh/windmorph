'use client';

import {
  FeaturedCarousel,
  FeaturedCarouselSlide,
  useFeaturedCarouselSlide,
} from '@windmorph/react-pro';
import { useEffect, useRef } from 'react';

const SLIDES = [
  { title: 'Spring collection', line: 'New colours for longer days', fill: 'bg-primary-container' },
  { title: 'Studio tour', line: 'A minute inside the workshop', video: true },
  { title: 'Weekend offers', line: 'Free delivery until Sunday', fill: 'bg-tertiary-container' },
];

/**
 * A slide that plays a video: it plays only while `mayMove` says it may (not paused, not under
 * reduced motion, in view, the tab showing), holds the carousel's timer while it plays, and
 * moves the carousel on when it ends.
 */
function VideoSlide({ title, line }: { title: string; line: string }) {
  const { mayMove, hold, next } = useFeaturedCarouselSlide();
  const video = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const element = video.current;
    if (!element) return;
    if (!mayMove) {
      element.pause();
      return;
    }
    void element.play().catch(() => undefined);
    const release = hold();
    return release;
  }, [mayMove, hold]);
  return (
    <div className="grid h-full *:[grid-area:1/1]">
      <video
        ref={video}
        src="/media/bento/bento-dark.mp4"
        poster="/media/bento/bento-dark.jpg"
        muted
        playsInline
        onEnded={next}
        className="size-full object-cover"
      />
      <div className="wm-featured-carousel-content flex flex-col justify-end gap-1 bg-gradient-to-t from-scrim/70 to-transparent pb-6">
        <h3 className="text-headline-small text-white">{title}</h3>
        <p className="text-body-medium text-white">{line}</p>
      </div>
    </div>
  );
}

/**
 * `autoAdvance` moves it on every 7 seconds (`{ interval }` to change it), shown by the current
 * dot filling. It waits while a mouse is over the slides, while less than half of it is in
 * view and while the tab is hidden; it stops for good once the person moves it or keyboard
 * focus comes in, until Play. The Pause control, first in the Tab order, stops it and the
 * video together; under reduced motion it never moves by itself.
 */
export function FeaturedCarouselAuto() {
  return (
    <FeaturedCarousel aria-label="This week" autoAdvance className="w-full">
      {SLIDES.map((slide) => (
        <FeaturedCarouselSlide key={slide.title} textValue={slide.title} media={slide.video}>
          {slide.video ? (
            <VideoSlide title={slide.title} line={slide.line} />
          ) : (
            <div className={`flex h-full flex-col justify-end ${slide.fill}`}>
              <div className="wm-featured-carousel-content flex flex-col gap-1 pb-6">
                <h3 className="text-headline-small text-on-surface">{slide.title}</h3>
                <p className="text-body-medium text-on-surface-variant">{slide.line}</p>
              </div>
            </div>
          )}
        </FeaturedCarouselSlide>
      ))}
    </FeaturedCarousel>
  );
}
