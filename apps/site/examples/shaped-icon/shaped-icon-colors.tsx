import { flowerShape } from '@windmorph/react/primitives';
import { ShapedIcon } from '@windmorph/react-pro';
import { StarIcon } from '../../components/icons';

const COLORS = ['primary', 'secondary', 'tertiary', 'neutral', 'error'] as const;

/**
 * The five colours, each a container role with its content colour. A shaped icon is
 * decorative unless it has an `aria-label`, like the last one here.
 */
export function ShapedIconColors() {
  return (
    <div className="flex flex-wrap items-center gap-4">
      {COLORS.map((color) => (
        <ShapedIcon
          key={color}
          color={color}
          shape={flowerShape}
          {...(color === 'error' && { 'aria-label': 'Needs attention' })}
        >
          <StarIcon />
        </ShapedIcon>
      ))}
    </div>
  );
}
