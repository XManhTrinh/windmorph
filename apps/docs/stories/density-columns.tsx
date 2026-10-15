import { DENSITIES, type Density } from '@windmorph/react';
import type { ReactNode } from 'react';

/**
 * The `Density` stories' layout: one column per level (0 to -3), each headed with its level,
 * inside `data-testid="density"` for the screenshots. Cases inside a column are named
 * `data-testid="<level>-<case>"` by the stories.
 */
export function DensityColumns({
  children,
  className = 'grid-cols-4',
}: {
  children: (density: Density) => ReactNode;
  className?: string;
}) {
  return (
    <div className={`grid items-start gap-6 ${className}`} data-testid="density">
      {DENSITIES.map((density) => (
        <div key={density} className="flex min-w-0 flex-col items-start gap-4">
          <p className="text-title-small">{`Density ${density}`}</p>
          {children(density)}
        </div>
      ))}
    </div>
  );
}
