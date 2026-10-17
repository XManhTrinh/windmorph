import { ShapedIcon } from '@windmorph/react-pro';
import { StarIcon } from '../../components/icons';

/** The four sizes (40, 56, 64 and 96px), in a circle and an Expressive shape. */
export function ShapedIconSizes() {
  return (
    <div className="flex flex-col gap-4">
      {(['circle', 'Cookie12Sided'] as const).map((shape) => (
        <div key={shape} className="flex items-end gap-4">
          {(['sm', 'md', 'lg', 'xl'] as const).map((size) => (
            <ShapedIcon key={size} shape={shape} size={size} tone="primary">
              <StarIcon />
            </ShapedIcon>
          ))}
        </div>
      ))}
    </div>
  );
}
