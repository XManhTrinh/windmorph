import { Skeleton, SkeletonGroup, type SkeletonAnimation } from '@windmorph/react-pro';

const ANIMATIONS: SkeletonAnimation[] = ['pulse', 'shimmer', 'none'];

/**
 * `pulse` (the default) fades the placeholders; `shimmer` sweeps a highlight from the start
 * edge (mirrored in right-to-left); `none` holds still. Both animations stop under reduced
 * motion.
 */
export function SkeletonAnimations() {
  return (
    <div className="grid w-full grid-cols-1 gap-6 medium:grid-cols-3">
      {ANIMATIONS.map((animation) => (
        <SkeletonGroup
          key={animation}
          label={`Loading (${animation})`}
          animation={animation}
          className="flex flex-col gap-2"
        >
          <p aria-hidden="true" className="text-label-large text-on-surface-variant">
            {animation}
          </p>
          <div className="flex items-center gap-3">
            <Skeleton variant="circle" />
            <Skeleton variant="text" typescale="title-small" className="w-2/3" />
          </div>
          <Skeleton className="h-20" corner="medium" />
        </SkeletonGroup>
      ))}
    </div>
  );
}
