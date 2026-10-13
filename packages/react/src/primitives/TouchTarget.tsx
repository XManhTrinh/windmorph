import { cn } from '../utils/cn';

export interface TouchTargetProps {
  className?: string;
}

/**
 * Extends the hit area of a small control to the 48×48px minimum without changing
 * its layout. Render it inside the component's inner content wrapper (which is
 * `relative`), never on the root, so consumer positioning of the root stays safe.
 */
export function TouchTarget({ className }: TouchTargetProps) {
  return (
    <span
      aria-hidden="true"
      data-touch-target=""
      className={cn(
        'absolute top-1/2 left-1/2 h-12 w-[max(100%,3rem)] -translate-x-1/2 -translate-y-1/2',
        className,
      )}
    />
  );
}
