import { ShelfPlaceholder, Skeleton } from '@windmorph/react-pro';

/**
 * While the cards load, `ShelfPlaceholder` lays out the same row, not scrolling and with no
 * arrows, with skeleton cards in it: ten fill the widest shelf. Nothing moves when the cards
 * arrive. An empty or failed row is the app's: leave it out, or put a notice in its place.
 */
export function ShelfLoading() {
  return (
    <div className="flex w-full flex-col gap-2">
      <Skeleton variant="text" typescale="title-large" className="w-40" />
      <ShelfPlaceholder>
        {Array.from({ length: 10 }, (_, index) => (
          <div key={index} className="flex flex-col gap-2">
            <Skeleton ratio="16/9" className="w-full rounded-corner-medium" />
            <Skeleton variant="text" typescale="title-small" className="w-4/5" />
            <Skeleton variant="text" typescale="body-small" className="w-3/5" />
          </div>
        ))}
      </ShelfPlaceholder>
    </div>
  );
}
