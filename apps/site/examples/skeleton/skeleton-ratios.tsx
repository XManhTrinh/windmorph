import { Skeleton, SkeletonGroup } from '@windmorph/react-pro';

/**
 * `ratio` gives a rectangle the shape of the picture it stands for, at whatever width it
 * gets: a 16:9 video, a square photo, a 4:3 card image. Nothing moves when they arrive.
 */
export function SkeletonRatios() {
  return (
    <SkeletonGroup label="Loading the videos" className="grid w-full gap-4 medium:grid-cols-3">
      <div className="flex flex-col gap-2">
        <Skeleton ratio="16/9" corner="medium" />
        <Skeleton variant="text" typescale="title-small" className="w-3/4" />
      </div>
      <div className="flex flex-col gap-2">
        <Skeleton ratio={1} corner="medium" />
        <Skeleton variant="text" typescale="title-small" className="w-1/2" />
      </div>
      <div className="flex flex-col gap-2">
        <Skeleton ratio="4/3" corner="medium" />
        <Skeleton variant="text" typescale="title-small" className="w-2/3" />
      </div>
    </SkeletonGroup>
  );
}
