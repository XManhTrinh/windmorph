import { Skeleton, SkeletonGroup } from '@windmorph/react-pro';

function CardSkeleton() {
  return (
    <li className="flex flex-col overflow-hidden rounded-corner-medium border border-outline-variant">
      <Skeleton className="h-24" corner="none" />
      <div className="flex flex-col gap-1 p-4">
        <Skeleton variant="text" typescale="title-medium" className="w-3/4" />
        <Skeleton variant="text" lines={2} />
      </div>
    </li>
  );
}

/**
 * A row of cards while it loads. The group names the region once ("Loading businesses"),
 * marks it busy and pulses every placeholder together; each text line is as tall as the
 * type-scale role it stands for, so nothing moves when the content arrives.
 */
export function SkeletonCards() {
  return (
    <SkeletonGroup
      as="ul"
      label="Loading businesses"
      className="grid w-full grid-cols-1 gap-4 medium:grid-cols-3"
    >
      <CardSkeleton />
      <CardSkeleton />
      <CardSkeleton />
    </SkeletonGroup>
  );
}
