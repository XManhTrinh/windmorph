import { Skeleton, SkeletonGroup } from '@windmorph/react-pro';

/**
 * The three shapes: `rectangle` for media and blocks (any `corner`), `circle` for avatars,
 * and `text` for lines sized to a type scale (`typescale`, with `lines` for a paragraph).
 * `tone="high"` is a step lighter, for placeholders on a darker container.
 */
export function SkeletonVariants() {
  return (
    <SkeletonGroup label="Loading the profile" className="grid w-full gap-6 medium:grid-cols-2">
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <Skeleton variant="circle" className="size-12" />
          <div className="flex flex-1 flex-col gap-1">
            <Skeleton variant="text" typescale="title-medium" className="w-1/2" />
            <Skeleton variant="text" typescale="body-small" className="w-1/3" />
          </div>
        </div>
        <Skeleton variant="text" lines={3} />
        <Skeleton className="h-32" corner="large" />
      </div>
      <div className="flex flex-col gap-3 rounded-corner-large bg-surface-container-highest p-4">
        <Skeleton variant="text" typescale="title-medium" tone="high" className="w-2/3" />
        <Skeleton variant="text" lines={2} tone="high" />
        <Skeleton className="h-20" corner="medium" tone="high" />
      </div>
    </SkeletonGroup>
  );
}
