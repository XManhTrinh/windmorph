import { Button } from '@windmorph/react';
import { FeaturedCarouselPlaceholder, Skeleton } from '@windmorph/react-pro';

/**
 * `FeaturedCarouselPlaceholder` draws the carousel's frame (one slide's box and its foot) with
 * your content in it: a skeleton while it loads, or a notice and Try again when it fails.
 * Nothing moves when the carousel arrives. `foot={false}` leaves out the foot, to match a
 * carousel of one slide that plays nothing.
 */
export function FeaturedCarouselLoading() {
  return (
    <div className="flex w-full flex-col gap-6">
      <FeaturedCarouselPlaceholder>
        <Skeleton className="h-full w-full rounded-none" />
      </FeaturedCarouselPlaceholder>
      <FeaturedCarouselPlaceholder slideClassName="bg-surface-container">
        <div className="flex flex-col items-center gap-3 text-on-surface">
          <p className="text-body-large">Couldn’t load the featured picks</p>
          <Button variant="text" size="sm">
            Try again
          </Button>
        </div>
      </FeaturedCarouselPlaceholder>
    </div>
  );
}
